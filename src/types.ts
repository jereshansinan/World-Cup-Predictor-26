export interface UserProfile {
  id: string; // Firebase Auth UID
  name: string;
  supportedTeams: string[]; // exactly 3 teams
  totalPoints: number;
}

export interface MatchFixture {
  id: string; // unique ID
  homeTeam: string;
  awayTeam: string;
  matchDate: string; // YYYY-MM-DD
  status: 'upcoming' | 'finished';
  homeScoreActual: number | null;
  awayScoreActual: number | null;
}

export interface Prediction {
  id: string; // prediction ID e.g. `${userId}_${matchId}`
  userId: string;
  matchId: string;
  homeScorePredicted: number | null;
  awayScorePredicted: number | null;
  pointsEarned: number | null;
  locked?: boolean; // is this prediction locked?
}

export interface UserStats {
  userId: string;
  name: string;
  supportedTeams: string[];
  totalPoints: number;
  correctOutcomes: number;
  exactScores: number;
  teamPenalties: number;
  teamBonuses: number;
}
