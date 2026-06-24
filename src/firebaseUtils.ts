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
import { SEED_USERS, SEED_MATCHES, SEED_PREDICTIONS, MATCH_ACTUAL_RESULTS } from './seed';

// Correct baseline player statistics up to match m40 aligned with the spreadsheet / leaderboard image.
export const BASELINE_STATS: { [userId: string]: { correctOutcomes: number; exactScores: number; teamBonuses: number; teamPenalties: number } } = {
  thapedi: { correctOutcomes: 24, exactScores: 5, teamBonuses: 6, teamPenalties: 0 },
  hlaisani: { correctOutcomes: 22, exactScores: 5, teamBonuses: 7, teamPenalties: 0 },
  jereshan: { correctOutcomes: 23, exactScores: 3, teamBonuses: 6, teamPenalties: 0 },
  fikile: { correctOutcomes: 21, exactScores: 5, teamBonuses: 6, teamPenalties: 0 },
  sanjay: { correctOutcomes: 21, exactScores: 3, teamBonuses: 8, teamPenalties: 0 },
  dylan: { correctOutcomes: 20, exactScores: 4, teamBonuses: 7, teamPenalties: 0 },
  janita: { correctOutcomes: 22, exactScores: 0, teamBonuses: 8, teamPenalties: 0 },
  alone: { correctOutcomes: 18, exactScores: 6, teamBonuses: 8, teamPenalties: 0 },
  tlamelo: { correctOutcomes: 19, exactScores: 1, teamBonuses: 8, teamPenalties: 0 },
  happy: { correctOutcomes: 18, exactScores: 3, teamBonuses: 7, teamPenalties: 0 },
  vuyolwethu: { correctOutcomes: 14, exactScores: 0, teamBonuses: 9, teamPenalties: 0 },
  nandipha: { correctOutcomes: 11, exactScores: 3, teamBonuses: 7, teamPenalties: 0 }
};

/**
 * Seeds initial users, matches, and default predictions into Firestore if they don't exist.
 */
export async function seedInitialData() {
  const usersPath = 'users';
  const matchesPath = 'matches';
  const predictionsPath = 'predictions';

  try {
    // 1. Gather existing data
    const matchesSnap = await getDocs(collection(db, matchesPath));
    const usersSnap = await getDocs(collection(db, usersPath));
    const predictionsSnap = await getDocs(collection(db, predictionsPath));

    // If matches and users are already seeded, skip to avoid quota exhaustion and overwriting manual scores.
    if (matchesSnap.size > 0 && usersSnap.size > 0) {
      console.log('Database matches and users are already seeded. Checking if we need to backfill predictions...');
      const testDocRef = doc(db, predictionsPath, 'sanjay_m45');
      const testDocSnap = await getDoc(testDocRef);
      if (testDocSnap.exists()) {
        console.log('Predictions for new matches are already backfilled. Skipping initial seed to conserve Firestore quota.');
        return;
      }
      
      console.log('Backfilling predictions for matches m45, m46, m47, m48...');
      const backfillBatch = writeBatch(db);
      const targetMatchIds = ['m45', 'm46', 'm47', 'm48'];
      
      // Also make sure the matches exist in Firestore!
      for (const mId of targetMatchIds) {
        const matchObj = SEED_MATCHES.find(m => m.id === mId);
        if (matchObj) {
          const matchDocRef = doc(db, matchesPath, mId);
          backfillBatch.set(matchDocRef, {
            id: mId,
            homeTeam: matchObj.homeTeam,
            awayTeam: matchObj.awayTeam,
            matchDate: matchObj.matchDate,
            status: 'upcoming',
            homeScoreActual: null,
            awayScoreActual: null
          }, { merge: true });
        }
      }

      // Add the predictions for these matches
      for (const item of SEED_PREDICTIONS) {
        if (!targetMatchIds.includes(item.matchId)) continue;
        
        for (const [userName, predStr] of Object.entries(item.predictions)) {
          const userId = userName.toLowerCase();
          const predictionId = `${userId}_${item.matchId}`;
          const predDocRef = doc(db, predictionsPath, predictionId);

          let homeScorePredicted: number | null = null;
          let awayScorePredicted: number | null = null;
          let isInitiallyLocked = false;

          if (predStr && predStr !== 'null') {
            const parts = predStr.split('-');
            if (parts.length === 2) {
              homeScorePredicted = parseInt(parts[0], 10);
              awayScorePredicted = parseInt(parts[1], 10);
              isInitiallyLocked = true;
            }
          }

          backfillBatch.set(predDocRef, {
            id: predictionId,
            userId: userId,
            matchId: item.matchId,
            homeScorePredicted,
            awayScorePredicted,
            pointsEarned: null,
            locked: isInitiallyLocked
          });
        }
      }
      
      await backfillBatch.commit();
      console.log('Backfilled predictions for m45-m48 successfully!');
      return;
    }

    const seedMatchIds = new Set(SEED_MATCHES.map((m) => m.id));
    const seedUserIds = new Set(SEED_USERS.map((u) => u.name.toLowerCase()));
    
    const seedPredIds = new Set<string>();
    for (const item of SEED_PREDICTIONS) {
      for (const userName of Object.keys(item.predictions)) {
        seedPredIds.add(`${userName.toLowerCase()}_${item.matchId}`);
      }
    }

    // --- PHASE A: Matches batch ---
    const matchesBatch = writeBatch(db);
    let matchesBatchSize = 0;

    const existingMatchesData = new Map<string, any>();
    matchesSnap.forEach((docSnap) => {
      existingMatchesData.set(docSnap.id, docSnap.data());
    });

    // Delete matches not in seed
    matchesSnap.forEach((docSnap) => {
      if (!seedMatchIds.has(docSnap.id)) {
        matchesBatch.delete(docSnap.ref);
        matchesBatchSize++;
      }
    });

    // Upsert matches in seed (with merge to ensure correct scores and status are loaded)
    for (const match of SEED_MATCHES) {
      const matchDocRef = doc(db, matchesPath, match.id);
      const existing = existingMatchesData.get(match.id);
      const staticResult = MATCH_ACTUAL_RESULTS[match.id];

      // Keep real updated status and score from DB if they exist and are completed/set
      const status = (existing && (existing.status === 'finished' || existing.homeScoreActual !== null))
        ? existing.status
        : (staticResult ? 'finished' : 'upcoming');

      const homeScoreActual = (existing && (existing.status === 'finished' || existing.homeScoreActual !== null))
        ? existing.homeScoreActual
        : (staticResult ? staticResult.home : null);

      const awayScoreActual = (existing && (existing.status === 'finished' || existing.awayScoreActual !== null))
        ? existing.awayScoreActual
        : (staticResult ? staticResult.away : null);

      matchesBatch.set(matchDocRef, {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        matchDate: match.matchDate,
        status,
        homeScoreActual,
        awayScoreActual
      }, { merge: true });
      matchesBatchSize++;
    }

    if (matchesBatchSize > 0) {
      console.log(`Commiting matches updates batch (size: ${matchesBatchSize})...`);
      await matchesBatch.commit();
    }

    // --- PHASE B: Users batch ---
    const usersBatch = writeBatch(db);
    let usersBatchSize = 0;

    // Delete users not in seed
    usersSnap.forEach((docSnap) => {
      if (!seedUserIds.has(docSnap.id)) {
        usersBatch.delete(docSnap.ref);
        usersBatchSize++;
      }
    });

    // Upsert users in seed
    for (const user of SEED_USERS) {
      const userId = user.name.toLowerCase();
      const userRef = doc(db, usersPath, userId);
      // Merge with existing users to preserve authUid fields if they signed up
      usersBatch.set(userRef, {
        id: userId,
        name: user.name,
        supportedTeams: user.supportedTeams
      }, { merge: true });
      usersBatchSize++;
    }

    if (usersBatchSize > 0) {
      console.log(`Commiting users updates batch (size: ${usersBatchSize})...`);
      await usersBatch.commit();
    }

    // --- PHASE C: Predictions batches (chunked to fit Firestore limits) ---
    const commitChunk = async (operations: { ref: any; type: 'set' | 'delete'; data?: any }[]) => {
      const b = writeBatch(db);
      for (const op of operations) {
        if (op.type === 'delete') {
          b.delete(op.ref);
        } else {
          b.set(op.ref, op.data);
        }
      }
      await b.commit();
    };

    let pOperations: { ref: any; type: 'set' | 'delete'; data?: any }[] = [];

    // Queue prediction deletions
    predictionsSnap.forEach((docSnap) => {
      if (!seedPredIds.has(docSnap.id)) {
        pOperations.push({ ref: docSnap.ref, type: 'delete' });
      }
    });

    // Queue predictions set
    for (const item of SEED_PREDICTIONS) {
      for (const [userName, predStr] of Object.entries(item.predictions)) {
        const userId = userName.toLowerCase();
        const predictionId = `${userId}_${item.matchId}`;
        const predDocRef = doc(db, predictionsPath, predictionId);

        let homeScorePredicted: number | null = null;
        let awayScorePredicted: number | null = null;
        let isInitiallyLocked = false;

        if (predStr && predStr !== 'null') {
          const parts = predStr.split('-');
          if (parts.length === 2) {
            homeScorePredicted = parseInt(parts[0], 10);
            awayScorePredicted = parseInt(parts[1], 10);
            isInitiallyLocked = true;
          }
        }

        pOperations.push({
          ref: predDocRef,
          type: 'set',
          data: {
            id: predictionId,
            userId: userId,
            matchId: item.matchId,
            homeScorePredicted,
            awayScorePredicted,
            pointsEarned: null,
            locked: isInitiallyLocked
          }
        });
      }
    }

    // Execute prediction batches in chunks of 400
    console.log(`Executing predictions updates operations (total: ${pOperations.length})...`);
    while (pOperations.length > 0) {
      const chunk = pOperations.splice(0, 400);
      await commitChunk(chunk);
    }

    console.log('Database synced & force-seeded with correct cohort list.');
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

      // If the match in the database is already finished or has manual actual scores set, do NOT edit or update it!
      // This protects manual corrections the admin makes directly in the Firestore database.
      if (dbMatch.status === 'finished' || (dbMatch.homeScoreActual !== null && dbMatch.homeScoreActual !== undefined)) {
        console.log(`Skipping sync update for completed/manually-set match: ${matchId}`);
        if (dbMatch.status !== 'finished') {
          updatedMatchesBatch.update(doc(db, matchesPath, matchId), { status: 'finished' });
          dbMatches[matchId].status = 'finished';
        }
        continue;
      }

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

      // Fallback if not found in API or fetch failed entirely. Use MATCH_ACTUAL_RESULTS if available.
      if (!foundInApi) {
        const staticResult = MATCH_ACTUAL_RESULTS[matchId];
        if (staticResult) {
          updatedMatchesBatch.update(doc(db, matchesPath, matchId), {
            status: 'finished',
            homeScoreActual: staticResult.home,
            awayScoreActual: staticResult.away
          });
          dbMatches[matchId].status = 'finished';
          dbMatches[matchId].homeScoreActual = staticResult.home;
          dbMatches[matchId].awayScoreActual = staticResult.away;
        } else {
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

    // Pre-initialize stats map for all users to prevent any empty fields
    for (const u of SEED_USERS) {
      const uid = u.name.toLowerCase();
      userStatsMap[uid] = { correctOutcomes: 0, exactScores: 0, points: 0 };
    }

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

      // Accumulate for user stats dynamically ONLY for subsequent matches (ID > m40)
      const mIdNum = parseInt(p.matchId.replace('m', ''), 10);
      if (mIdNum > 40) {
        const uid = p.userId;
        if (!userStatsMap[uid]) {
          userStatsMap[uid] = { correctOutcomes: 0, exactScores: 0, points: 0 };
        }
        userStatsMap[uid].points += pointsEarned;
        if (isCorrectOutcome) userStatsMap[uid].correctOutcomes++;
        if (isExactScore) userStatsMap[uid].exactScores++;
      }
    }
    await predictionUpdatesBatch.commit();

    // 5. Calculate Supporter Penalties and Bonuses (dynamic count from matches > m40)
    const teamWinCounts: { [teamName: string]: number } = {};
    const teamLossCounts: { [teamName: string]: number } = {};
    const teamDrawCounts: { [teamName: string]: number } = {};

    for (const matchId of Object.keys(dbMatches)) {
      const match = dbMatches[matchId];
      if (match && match.status === 'finished' && match.homeScoreActual !== null && match.awayScoreActual !== null) {
        const mIdNum = parseInt(matchId.replace('m', ''), 10);
        if (mIdNum > 40) {
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
    }

    const userUpdatesBatch = writeBatch(db);
    for (const user of usersList) {
      const userId = user.id; // Sanjay or sanjay etc.
      const base = BASELINE_STATS[userId] || { correctOutcomes: 0, exactScores: 0, teamBonuses: 0, teamPenalties: 0 };
      const dyn = userStatsMap[userId] || { correctOutcomes: 0, exactScores: 0, points: 0 };

      // Count user's supported teams losing, winning, and drawing dynamically on newer matches (ID > m40)
      let penaltiesDyn = 0;
      let bonusesDyn = 0;
      const supported: string[] = user.supportedTeams || [];
      for (const team of supported) {
        if (teamLossCounts[team]) {
          penaltiesDyn += teamLossCounts[team] * 2; // -2 points per loss
        }
        if (teamWinCounts[team]) {
          bonusesDyn += teamWinCounts[team] * 2; // +2 points per win
        }
        if (teamDrawCounts[team]) {
          bonusesDyn += teamDrawCounts[team] * 1; // +1 point per draw
        }
      }

      const correctOutcomes = base.correctOutcomes + dyn.correctOutcomes;
      const exactScores = base.exactScores + dyn.exactScores;
      const teamPenalties = base.teamPenalties + penaltiesDyn;
      const teamBonuses = base.teamBonuses + bonusesDyn;
      const totalPoints = (correctOutcomes * 3) + (exactScores * 2) + teamBonuses - teamPenalties;

      userUpdatesBatch.update(doc(db, usersPath, userId), {
        totalPoints,
        correctOutcomes,
        exactScores,
        teamPenalties,
        teamBonuses
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
    // Force sign out the current user session to assert a completely fresh anonymous user on every profile switch.
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.warn('Signout warning (can be normal if not signed in):', signOutError);
    }

    const credential = await signInAnonymously(auth);
    const authUser = credential.user;

    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Record the fresh auth session UID to cleanly separate user predictions
      await updateDoc(userRef, {
        authUid: authUser.uid
      });
      return {
        id: userId,
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
