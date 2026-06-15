import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  getDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInAnonymously
} from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { UserProfile, MatchFixture, Prediction, UserStats } from './types';
import { SEED_USERS, SEED_MATCHES, SEED_PREDICTIONS } from './seed';

/**
 * Seeds initial users, matches, and default predictions into Firestore if they don't exist.
 */
export async function seedInitialData() {
  const usersPath = 'users';
  const matchesPath = 'matches';
  const predictionsPath = 'predictions';

  try {
    // 1. Gather existing matches in Firestore
    const matchesSnap = await getDocs(collection(db, matchesPath));
    const existingMatchIds = new Set<string>();
    matchesSnap.forEach((doc) => existingMatchIds.add(doc.id));

    const matchesBatch = writeBatch(db);
    let neededMatchCommit = false;

    for (const match of SEED_MATCHES) {
      const matchRef = doc(db, matchesPath, match.id);
      if (!existingMatchIds.has(match.id)) {
        // missing entirely, create it
        matchesBatch.set(matchRef, {
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          matchDate: match.matchDate,
          status: 'upcoming',
          homeScoreActual: null,
          awayScoreActual: null
        });
        neededMatchCommit = true;
      } else {
        // match exists; merge/update matchDate just in case it has changed (e.g. Saudi Arabia / Iran tuesday change)
        matchesBatch.set(matchRef, {
          matchDate: match.matchDate
        }, { merge: true });
        neededMatchCommit = true;
      }
    }

    if (neededMatchCommit) {
      console.log('Syncing / seeding match dates and missing matches...');
      await matchesBatch.commit();
    }

    // 2. See if any seeded users are missing
    const usersSnap = await getDocs(collection(db, usersPath));
    const existingUserIds = new Set<string>();
    usersSnap.forEach((doc) => existingUserIds.add(doc.id));

    const usersBatch = writeBatch(db);
    let neededUsersCommit = false;

    for (const user of SEED_USERS) {
      const userId = user.name.toLowerCase();
      if (!existingUserIds.has(userId)) {
        const userRef = doc(db, usersPath, userId);
        usersBatch.set(userRef, {
          id: userId,
          name: user.name,
          supportedTeams: user.supportedTeams,
          totalPoints: 0,
          authUid: null
        });
        neededUsersCommit = true;
      }
    }

    if (neededUsersCommit) {
      console.log('Seeding missing users...');
      await usersBatch.commit();
    }

    // 3. Sync/seed missing predictions
    const predictionsSnap = await getDocs(collection(db, predictionsPath));
    const existingPredIds = new Set<string>();
    predictionsSnap.forEach((doc) => existingPredIds.add(doc.id));

    const predsBatch = writeBatch(db);
    let neededPredsCommit = false;

    for (const item of SEED_PREDICTIONS) {
      for (const [userName, predStr] of Object.entries(item.predictions)) {
        const userId = userName.toLowerCase();
        const predictionId = `${userId}_${item.matchId}`;

        if (!existingPredIds.has(predictionId)) {
          const predDocRef = doc(db, predictionsPath, predictionId);

          let homeScorePredicted: number | null = null;
          let awayScorePredicted: number | null = null;

          if (predStr && predStr !== 'null') {
            const parts = predStr.split('-');
            if (parts.length === 2) {
              homeScorePredicted = parseInt(parts[0], 10);
              awayScorePredicted = parseInt(parts[1], 10);
            }
          }

          predsBatch.set(predDocRef, {
            id: predictionId,
            userId: userId,
            matchId: item.matchId,
            homeScorePredicted,
            awayScorePredicted,
            pointsEarned: null,
            locked: true
          });
          neededPredsCommit = true;
        }
      }
    }

    if (neededPredsCommit) {
      console.log('Seeding missing predictions...');
      await predsBatch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed');
  }
}

/**
 * Normalizes team names for fuzzy pairing against database entities
 */
function normalizeTeam(name: string): string {
  if (!name) return '';
  let s = name.toLowerCase().trim();
  if (s.includes('usa') || s.includes('united states')) return 'usa';
  if (s.includes('korea republic') || s.includes('south korea') || s.includes('korea, republic')) return 'southkorea';
  if (s.includes('czech') || s.includes('czechia') || s.includes('czech republic')) return 'czechia';
  if (s.includes('bosnia')) return 'bosniaandherzegovina';
  if (s.includes('turkey') || s.includes('türkiye')) return 'türkiye';
  if (s.includes('cote') || s.includes('côte') || s.includes('ivory')) return 'ivorycoast';
  if (s.includes('curacao') || s.includes('curaçao')) return 'curacao';
  if (s.includes('cape verde') || s.includes('cabo verde')) return 'capeverde';
  if (s.includes('south africa')) return 'southafrica';
  if (s.includes('saudi arabia')) return 'saudiarabia';
  if (s.includes('new zealand')) return 'newzealand';
  return s.replace(/[^a-z0-9]/g, '');
}

/**
 * Returns true if the database match teams match the external API teams
 */
function isMatchPairGroup(dbMatch: any, apiHome: string, apiAway: string) {
  const h1 = normalizeTeam(dbMatch.homeTeam);
  const a1 = normalizeTeam(dbMatch.awayTeam);
  const h2 = normalizeTeam(apiHome);
  const a2 = normalizeTeam(apiAway);
  return h1 === h2 && a1 === a2;
}

/**
 * Fetches external World Cup scores, updates match status/scores, 
 * calculates user predictions, deducts supporter penalties, and updates profiles.
 */
export async function syncScoresAndPoints(): Promise<any> {
  const matchesPath = 'matches';
  const predictionsPath = 'predictions';
  const usersPath = 'users';

  try {
    // Make sure we have initial data seeded first
    await seedInitialData();

    // 1. Fetch matches from database
    const matchesSnap = await getDocs(collection(db, matchesPath));
    const dbMatches: { [id: string]: MatchFixture } = {};
    matchesSnap.forEach((doc) => {
      dbMatches[doc.id] = doc.data() as MatchFixture;
    });

    // 2. Perform live API fetch via backend proxy to bypass browser CORS constraints and secure API key
    let apiMatches: any[] = [];
    let fetchError: string | null = null;

    try {
      console.log('Fetching live fixtures via secure proxy endpoint /api/football-matches...');
      const response = await fetch('/api/football-matches', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json.matches)) {
          apiMatches = json.matches;
          console.log(`Successfully fetched ${apiMatches.length} matches from proxy.`);
        } else {
          console.warn('Response format is not as expected:', json);
          fetchError = json.error || 'Server proxy did not return a valid matches list';
        }
      } else {
        const errorJson = await response.json().catch(() => ({}));
        fetchError = errorJson.error || `Proxy returned Status ${response.status}`;
        console.error('Failed to get fixtures from proxy:', fetchError);
      }
    } catch (err: any) {
      console.error('Error fetching from local server proxy:', err);
      fetchError = err.message || String(err);
    }

    // 3. Update matches collection strictly from API
    const updatedMatchesBatch = writeBatch(db);
    const finishedMatches: string[] = [];
    let realApiCount = 0;

    for (const matchId of Object.keys(dbMatches)) {
      const dbMatch = dbMatches[matchId];
      let foundInApi = false;

      if (apiMatches && apiMatches.length > 0) {
        const apiFixture = apiMatches.find((item: any) => 
          item.homeTeam && item.awayTeam && item.homeTeam.name && item.awayTeam.name &&
          isMatchPairGroup(dbMatch, item.homeTeam.name, item.awayTeam.name)
        );

        if (apiFixture) {
          foundInApi = true;
          const apiStatus = apiFixture.status;
          const apiHomeGoals = apiFixture.score?.fullTime?.home;
          const apiAwayGoals = apiFixture.score?.fullTime?.away;

          // Check if it's finished and goals are populated
          const isFinishedInApi = apiStatus === 'FINISHED' && apiHomeGoals !== null && apiHomeGoals !== undefined && apiAwayGoals !== null && apiAwayGoals !== undefined;

          if (isFinishedInApi) {
            realApiCount++;
            updatedMatchesBatch.update(doc(db, matchesPath, matchId), {
              status: 'finished',
              homeScoreActual: apiHomeGoals,
              awayScoreActual: apiAwayGoals
            });
            dbMatches[matchId].status = 'finished';
            dbMatches[matchId].homeScoreActual = apiHomeGoals;
            dbMatches[matchId].awayScoreActual = apiAwayGoals;
            finishedMatches.push(matchId);
          } else {
            // It is upcoming/not finished in the API or matches not started.
            updatedMatchesBatch.update(doc(db, matchesPath, matchId), {
              status: 'upcoming',
              homeScoreActual: null,
              awayScoreActual: null
            });
            dbMatches[matchId].status = 'upcoming';
            dbMatches[matchId].homeScoreActual = null;
            dbMatches[matchId].awayScoreActual = null;
          }
        }
      }

      // Fallback if not found in API or fetch failed entirely
      if (!foundInApi) {
        updatedMatchesBatch.update(doc(db, matchesPath, matchId), {
          status: 'upcoming',
          homeScoreActual: null,
          awayScoreActual: null
        });
        dbMatches[matchId].status = 'upcoming';
        dbMatches[matchId].homeScoreActual = null;
        dbMatches[matchId].awayScoreActual = null;
      }
    }
    
    await updatedMatchesBatch.commit();
    console.log(`Sync status summary: Updated ${realApiCount} matches using real football-data.org.`);

    // 4. Fetch predictions and users to calculate points
    const predictionsSnap = await getDocs(collection(db, predictionsPath));
    const predictionsList: Prediction[] = [];
    predictionsSnap.forEach((doc) => {
      predictionsList.push(doc.data() as Prediction);
    });

    const usersSnap = await getDocs(collection(db, usersPath));
    const usersList: any[] = [];
    usersSnap.forEach((doc) => {
      usersList.push(doc.data());
    });

    // Compute predictions points
    const predictionUpdatesBatch = writeBatch(db);
    const userStatsMap: { [userId: string]: { correctOutcomes: number; exactScores: number; points: number } } = {};

    for (const p of predictionsList) {
      const match = dbMatches[p.matchId];
      if (!match || match.status !== 'finished') continue;

      const actHome = match.homeScoreActual;
      const actAway = match.awayScoreActual;

      if (actHome === null || actAway === null) continue;

      let pointsEarned = 0;
      let isCorrectOutcome = false;
      let isExactScore = false;

      // Calculate outcome
      if (p.homeScorePredicted !== null && p.awayScorePredicted !== null) {
        const predHome = p.homeScorePredicted;
        const predAway = p.awayScorePredicted;

        const actualDiff = actHome - actAway;
        const predDiff = predHome - predAway;

        const actualOutcome = actualDiff > 0 ? 'home' : actualDiff < 0 ? 'away' : 'draw';
        const predOutcome = predDiff > 0 ? 'home' : predDiff < 0 ? 'away' : 'draw';

        if (actualOutcome === predOutcome) {
          isCorrectOutcome = true;
          pointsEarned = 3;
          if (actHome === predHome && actAway === predAway) {
            isExactScore = true;
            pointsEarned = 5; // 3 + 2 bonus
          }
        }
      } else {
        // null prediction results in a loss (0 points)
        pointsEarned = 0;
      }

      predictionUpdatesBatch.update(doc(db, predictionsPath, p.id), {
        pointsEarned
      });

      // Accumulate for user stats
      if (!userStatsMap[p.userId]) {
        userStatsMap[p.userId] = { correctOutcomes: 0, exactScores: 0, points: 0 };
      }
      userStatsMap[p.userId].points += pointsEarned;
      if (isCorrectOutcome) userStatsMap[p.userId].correctOutcomes++;
      if (isExactScore) userStatsMap[p.userId].exactScores++;
    }
    await predictionUpdatesBatch.commit();

    // 5. Calculate Supporter Penalties and Bonuses
    // Iterate through ALL matches from dbMatches to find all completed match outcomes for supporter bonuses and penalties.
    const teamWinCounts: { [teamName: string]: number } = {};
    const teamLossCounts: { [teamName: string]: number } = {};
    const teamDrawCounts: { [teamName: string]: number } = {};

    for (const matchId of Object.keys(dbMatches)) {
      const match = dbMatches[matchId];
      if (match && match.status === 'finished' && match.homeScoreActual !== null && match.awayScoreActual !== null) {
        if (match.homeScoreActual > match.awayScoreActual) {
          teamWinCounts[match.homeTeam] = (teamWinCounts[match.homeTeam] || 0) + 1;
          teamLossCounts[match.awayTeam] = (teamLossCounts[match.awayTeam] || 0) + 1;
        } else if (match.awayScoreActual > match.homeScoreActual) {
          teamWinCounts[match.awayTeam] = (teamWinCounts[match.awayTeam] || 0) + 1;
          teamLossCounts[match.homeTeam] = (teamLossCounts[match.homeTeam] || 0) + 1;
        } else {
          // Both teams draw
          teamDrawCounts[match.homeTeam] = (teamDrawCounts[match.homeTeam] || 0) + 1;
          teamDrawCounts[match.awayTeam] = (teamDrawCounts[match.awayTeam] || 0) + 1;
        }
      }
    }

    const userUpdatesBatch = writeBatch(db);
    for (const user of usersList) {
      const userId = user.id; // Sanjay or sanjay etc.
      const stats = userStatsMap[userId] || { correctOutcomes: 0, exactScores: 0, points: 0 };

      // Count user's supported teams losing, winning, and drawing
      let penalties = 0;
      let bonuses = 0;
      const supported: string[] = user.supportedTeams || [];
      for (const team of supported) {
        if (teamLossCounts[team]) {
          penalties += teamLossCounts[team] * 2; // -2 points per loss
        }
        if (teamWinCounts[team]) {
          bonuses += teamWinCounts[team] * 2; // +2 points per win
        }
        if (teamDrawCounts[team]) {
          bonuses += teamDrawCounts[team] * 1; // +1 point per draw
        }
      }

      const totalPoints = stats.points + bonuses - penalties;

      userUpdatesBatch.update(doc(db, usersPath, userId), {
        totalPoints,
        correctOutcomes: stats.correctOutcomes,
        exactScores: stats.exactScores,
        teamPenalties: penalties,
        teamBonuses: bonuses
      });
    }
    await userUpdatesBatch.commit();

    console.log('Points and penalties recalculation completed successfully.');
    
    return {
      success: true,
      realApiCount,
      fetchError
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'sync');
  }
}

/**
 * Handles profile-selection login with no passwords.
 * Under the hood, this authenticates the client anonymously with Firebase Auth and links
 * the authUid to the selected user record in Firestore.
 */
export async function loginByProfile(userName: string): Promise<any> {
  const userId = userName.toLowerCase();
  const userRef = doc(db, 'users', userId);
  
  try {
    let authUser = auth.currentUser;
    if (!authUser) {
      const credential = await signInAnonymously(auth);
      authUser = credential.user;
    }

    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      await updateDoc(userRef, {
        authUid: authUser.uid
      });
      return {
        ...userData,
        authUid: authUser.uid
      };
    } else {
      const newUser = {
        id: userId,
        name: userName,
        supportedTeams: SEED_USERS.find(u => u.name === userName)?.supportedTeams || [],
        totalPoints: 0,
        authUid: authUser.uid
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
  } catch (error: any) {
    console.error('Login Failed: ', error);
    throw new Error(error.message || 'Login failed.');
  }
}
