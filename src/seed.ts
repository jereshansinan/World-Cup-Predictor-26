export interface SeedUser {
  name: string;
  supportedTeams: string[];
}

export interface SeedPrediction {
  matchId: string;
  predictions: { [userName: string]: string | null };
}

export const SEED_USERS: SeedUser[] = [
  { name: 'Sanjay', supportedTeams: ['Argentina', 'Spain', 'Brazil'] },
  { name: 'Janita', supportedTeams: ['Spain', 'France', 'Brazil'] },
  { name: 'Hlaisani', supportedTeams: ['Spain', 'France', 'England'] },
  { name: 'Vuyolwethu', supportedTeams: ['Germany', 'Brazil', 'Argentina'] },
  { name: 'Thapedi', supportedTeams: ['Portugal', 'France', 'Spain'] },
  { name: 'Fikile', supportedTeams: ['France', 'Portugal', 'Spain'] },
  { name: 'Jereshan', supportedTeams: ['Portugal', 'France', 'Spain'] },
  { name: 'Happy', supportedTeams: ['England', 'France', 'Spain'] },
  { name: 'Alone', supportedTeams: ['Germany', 'Argentina', 'France'] },
  { name: 'Dylan', supportedTeams: ['Spain', 'Brazil', 'Portugal'] },
  { name: 'Nandipha', supportedTeams: ['Spain', 'Argentina', 'France'] },
  { name: 'Tlamelo', supportedTeams: ['Spain', 'France', 'Brazil'] }
];

export const SEED_MATCHES = [
  { id: 'm1', homeTeam: 'Mexico', awayTeam: 'South Africa', matchDate: '2026-06-11' },
  { id: 'm2', homeTeam: 'South Korea', awayTeam: 'Czechia', matchDate: '2026-06-11' },
  { id: 'm3', homeTeam: 'Canada', awayTeam: 'Bosnia and Herzegovina', matchDate: '2026-06-12' },
  { id: 'm4', homeTeam: 'USA', awayTeam: 'Paraguay', matchDate: '2026-06-12' },
  { id: 'm5', homeTeam: 'Haiti', awayTeam: 'Scotland', matchDate: '2026-06-13' },
  { id: 'm6', homeTeam: 'Australia', awayTeam: 'Türkiye', matchDate: '2026-06-13' },
  { id: 'm7', homeTeam: 'Brazil', awayTeam: 'Morocco', matchDate: '2026-06-13' },
  { id: 'm8', homeTeam: 'Qatar', awayTeam: 'Switzerland', matchDate: '2026-06-13' },
  { id: 'm9', homeTeam: 'Ivory Coast', awayTeam: 'Ecuador', matchDate: '2026-06-14' },
  { id: 'm10', homeTeam: 'Germany', awayTeam: 'Curacao', matchDate: '2026-06-14' },
  { id: 'm11', homeTeam: 'Netherlands', awayTeam: 'Japan', matchDate: '2026-06-14' },
  { id: 'm12', homeTeam: 'Sweden', awayTeam: 'Tunisia', matchDate: '2026-06-14' },
  { id: 'm13', homeTeam: 'Saudi Arabia', awayTeam: 'Uruguay', matchDate: '2026-06-16' },
  { id: 'm14', homeTeam: 'Spain', awayTeam: 'Cape Verde', matchDate: '2026-06-15' },
  { id: 'm15', homeTeam: 'Iran', awayTeam: 'New Zealand', matchDate: '2026-06-16' },
  { id: 'm16', homeTeam: 'Belgium', awayTeam: 'Egypt', matchDate: '2026-06-15' }
];

export const SEED_PREDICTIONS: SeedPrediction[] = [
  {
    matchId: 'm1',
    predictions: {
      Sanjay: '2-0', Janita: '2-1', Hlaisani: '3-1', Vuyolwethu: '0-0', Tlamelo: '1-2',
      Thapedi: '1-1', Fikile: '2-0', Jereshan: '1-1', Happy: '1-2', Alone: '2-1',
      Dylan: '3-1', Nandipha: '2-0'
    }
  },
  {
    matchId: 'm2',
    predictions: {
      Sanjay: '0-0', Janita: '1-1', Hlaisani: '2-0', Vuyolwethu: '1-2', Tlamelo: '1-3',
      Thapedi: '1-0', Fikile: '1-1', Jereshan: '2-1', Happy: '3-2', Alone: '1-1',
      Dylan: '2-1', Nandipha: '1-1'
    }
  },
  {
    matchId: 'm3',
    predictions: {
      Sanjay: '2-1', Janita: '2-1', Hlaisani: '1-1', Vuyolwethu: '2-0', Tlamelo: '0-2',
      Thapedi: '3-0', Fikile: '2-1', Jereshan: '1-0', Happy: '1-1', Alone: '2-0',
      Dylan: '1-2', Nandipha: '2-1'
    }
  },
  {
    matchId: 'm4',
    predictions: {
      Sanjay: '2-1', Janita: '1-1', Hlaisani: '2-1', Vuyolwethu: '0-1', Tlamelo: '2-1',
      Thapedi: '1-2', Fikile: '2-1', Jereshan: '2-1', Happy: '3-2', Alone: '1-0',
      Dylan: '1-2', Nandipha: '1-0'
    }
  },
  {
    matchId: 'm5',
    predictions: {
      Sanjay: '1-1', Janita: '1-2', Hlaisani: '0-2', Vuyolwethu: '1-3', Tlamelo: '0-3',
      Thapedi: '0-2', Fikile: '0-2', Jereshan: '1-3', Happy: '2-2', Alone: '0-1',
      Dylan: '0-2', Nandipha: '2-1'
    }
  },
  {
    matchId: 'm6',
    predictions: {
      Sanjay: '1-2', Janita: '1-2', Hlaisani: '1-3', Vuyolwethu: '1-2', Tlamelo: '0-2',
      Thapedi: '0-1', Fikile: '1-2', Jereshan: '0-2', Happy: '0-2', Alone: '0-3',
      Dylan: '1-2', Nandipha: '2-1'
    }
  },
  {
    matchId: 'm7',
    predictions: {
      Sanjay: '2-0', Janita: '2-1', Hlaisani: '2-1', Vuyolwethu: '2-0', Tlamelo: '3-1',
      Thapedi: '1-1', Fikile: '3-1', Jereshan: '2-2', Happy: '3-2', Alone: '1-0',
      Dylan: '2-0', Nandipha: '2-1'
    }
  },
  {
    matchId: 'm8',
    predictions: {
      Sanjay: '0-3', Janita: '0-2', Hlaisani: '0-4', Vuyolwethu: '2-1', Tlamelo: '0-3',
      Thapedi: '0-1', Fikile: '1-2', Jereshan: '0-2', Happy: '3-0', Alone: '0-2',
      Dylan: '0-3', Nandipha: '2-0'
    }
  },
  {
    matchId: 'm9',
    predictions: {
      Sanjay: '2-1', Janita: '1-1', Hlaisani: '3-1', Vuyolwethu: '2-0', Tlamelo: '2-1',
      Thapedi: '2-1', Fikile: '2-2', Jereshan: '1-1', Happy: '1-1', Alone: '1-1',
      Dylan: '1-2', Nandipha: '1-1'
    }
  },
  {
    matchId: 'm10',
    predictions: {
      Sanjay: '4-0', Janita: '3-0', Hlaisani: '2-0', Vuyolwethu: '2-0', Tlamelo: '5-0',
      Thapedi: '3-0', Fikile: '4-0', Jereshan: '4-0', Happy: '6-2', Alone: '4-1',
      Dylan: '5-0', Nandipha: '4-0'
    }
  },
  {
    matchId: 'm11',
    predictions: {
      Sanjay: '2-1', Janita: '2-0', Hlaisani: '2-0', Vuyolwethu: '1-1', Tlamelo: '3-0',
      Thapedi: '3-1', Fikile: '2-0', Jereshan: '2-0', Happy: '0-2', Alone: '2-0',
      Dylan: '2-0', Nandipha: '1-0'
    }
  },
  {
    matchId: 'm12',
    predictions: {
      Sanjay: '2-0', Janita: '1-0', Hlaisani: '1-1', Vuyolwethu: null, Tlamelo: '2-2',
      Thapedi: '2-1', Fikile: '2-1', Jereshan: '1-0', Happy: '2-0', Alone: '2-1',
      Dylan: '1-1', Nandipha: '2-0'
    }
  },
  {
    matchId: 'm13',
    predictions: {
      Sanjay: null, Janita: null, Hlaisani: null, Vuyolwethu: null, Tlamelo: '0-3',
      Thapedi: null, Fikile: null, Jereshan: null, Happy: '0-2', Alone: null,
      Dylan: null, Nandipha: '2-0'
    }
  },
  {
    matchId: 'm14',
    predictions: {
      Sanjay: null, Janita: null, Hlaisani: null, Vuyolwethu: null, Tlamelo: '3-0',
      Thapedi: null, Fikile: null, Jereshan: '3-0', Happy: '3-1', Alone: null,
      Dylan: null, Nandipha: null
    }
  },
  {
    matchId: 'm15',
    predictions: {
      Sanjay: null, Janita: null, Hlaisani: null, Vuyolwethu: null, Tlamelo: null,
      Thapedi: null, Fikile: null, Jereshan: null, Happy: '1-1', Alone: null,
      Dylan: null, Nandipha: null
    }
  },
  {
    matchId: 'm16',
    predictions: {
      Sanjay: null, Janita: null, Hlaisani: null, Vuyolwethu: null, Tlamelo: '2-0',
      Thapedi: null, Fikile: null, Jereshan: null, Happy: '3-2', Alone: null,
      Dylan: null, Nandipha: null
    }
  }
];

// Actual scores when finished
export const MATCH_ACTUAL_RESULTS: { [matchId: string]: { home: number; away: number } } = {
  m1: { home: 2, away: 0 },
  m2: { home: 1, away: 2 },
  m3: { home: 2, away: 0 },
  m4: { home: 2, away: 1 },
  m5: { home: 1, away: 3 },
  m6: { home: 1, away: 2 },
  m7: { home: 2, away: 1 },
  m8: { home: 0, away: 3 },
  m9: { home: 2, away: 1 },
  m10: { home: 4, away: 0 },
  m11: { home: 2, away: 0 },
  m12: { home: 2, away: 0 }
};
