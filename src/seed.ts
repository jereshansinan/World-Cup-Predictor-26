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
  { id: 'm13', homeTeam: 'Saudi Arabia', awayTeam: 'Uruguay', matchDate: '2026-06-15' },
  { id: 'm14', homeTeam: 'Spain', awayTeam: 'Cape Verde', matchDate: '2026-06-15' },
  { id: 'm15', homeTeam: 'Iran', awayTeam: 'New Zealand', matchDate: '2026-06-15' },
  { id: 'm16', homeTeam: 'Belgium', awayTeam: 'Egypt', matchDate: '2026-06-15' },
  { id: 'm17', homeTeam: 'France', awayTeam: 'Senegal', matchDate: '2026-06-16' },
  { id: 'm18', homeTeam: 'Iraq', awayTeam: 'Norway', matchDate: '2026-06-16' },
  { id: 'm19', homeTeam: 'Argentina', awayTeam: 'Algeria', matchDate: '2026-06-16' },
  { id: 'm20', homeTeam: 'Austria', awayTeam: 'Jordan', matchDate: '2026-06-16' },
  { id: 'm21', homeTeam: 'Ghana', awayTeam: 'Panama', matchDate: '2026-06-17' },
  { id: 'm22', homeTeam: 'England', awayTeam: 'Croatia', matchDate: '2026-06-17' },
  { id: 'm23', homeTeam: 'Portugal', awayTeam: 'DR Congo', matchDate: '2026-06-17' },
  { id: 'm24', homeTeam: 'Uzbekistan', awayTeam: 'Colombia', matchDate: '2026-06-17' },
  { id: 'm25', homeTeam: 'Czechia', awayTeam: 'South Africa', matchDate: '2026-06-18' },
  { id: 'm26', homeTeam: 'Switzerland', awayTeam: 'Bosnia and Herzegovina', matchDate: '2026-06-18' },
  { id: 'm27', homeTeam: 'Canada', awayTeam: 'Qatar', matchDate: '2026-06-19' },
  { id: 'm28', homeTeam: 'Mexico', awayTeam: 'Republic of Korea', matchDate: '2026-06-19' },
  { id: 'm29', homeTeam: 'USA', awayTeam: 'Australia', matchDate: '2026-06-19' },
  { id: 'm30', homeTeam: 'Scotland', awayTeam: 'Morocco', matchDate: '2026-06-20' },
  { id: 'm31', homeTeam: 'Brazil', awayTeam: 'Haiti', matchDate: '2026-06-20' },
  { id: 'm32', homeTeam: 'Türkiye', awayTeam: 'Paraguay', matchDate: '2026-06-20' },
  { id: 'm33', homeTeam: 'Netherlands', awayTeam: 'Sweden', matchDate: '2026-06-20' },
  { id: 'm34', homeTeam: 'Germany', awayTeam: 'Ivory Coast', matchDate: '2026-06-20' },
  { id: 'm35', homeTeam: 'Ecuador', awayTeam: 'Curacao', matchDate: '2026-06-21' },
  { id: 'm36', homeTeam: 'Tunisia', awayTeam: 'Japan', matchDate: '2026-06-21' },
  { id: 'm37', homeTeam: 'Spain', awayTeam: 'Saudi Arabia', matchDate: '2026-06-21' },
  { id: 'm38', homeTeam: 'Belgium', awayTeam: 'Iran', matchDate: '2026-06-21' },
  { id: 'm39', homeTeam: 'Uruguay', awayTeam: 'Cape Verde', matchDate: '2026-06-22' },
  { id: 'm40', homeTeam: 'New Zealand', awayTeam: 'Egypt', matchDate: '2026-06-22' },
  { id: 'm41', homeTeam: 'Argentina', awayTeam: 'Austria', matchDate: '2026-06-22' },
  { id: 'm42', homeTeam: 'France', awayTeam: 'Iraq', matchDate: '2026-06-22' },
  { id: 'm43', homeTeam: 'Norway', awayTeam: 'Senegal', matchDate: '2026-06-23' },
  { id: 'm44', homeTeam: 'Jordan', awayTeam: 'Algeria', matchDate: '2026-06-23' },
  { id: 'm45', homeTeam: 'Portugal', awayTeam: 'Uzbekistan', matchDate: '2026-06-23' },
  { id: 'm46', homeTeam: 'England', awayTeam: 'Ghana', matchDate: '2026-06-23' },
  { id: 'm47', homeTeam: 'Panama', awayTeam: 'Croatia', matchDate: '2026-06-24' },
  { id: 'm48', homeTeam: 'Colombia', awayTeam: 'Congo DR', matchDate: '2026-06-24' },
  { id: 'm49', homeTeam: 'Switzerland', awayTeam: 'Canada', matchDate: '2026-06-24' },
  { id: 'm50', homeTeam: 'Bosnia and Herzegovina', awayTeam: 'Qatar', matchDate: '2026-06-24' }
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
      Sanjay: '1-2', Janita: '1-2', Hlaisani: '1-2', Vuyolwethu: null, Tlamelo: '0-3',
      Thapedi: '1-2', Fikile: '0-3', Jereshan: '1-2', Happy: '0-2', Alone: '0-2',
      Dylan: '1-1', Nandipha: '2-0'
    }
  },
  {
    matchId: 'm14',
    predictions: {
      Sanjay: '4-0', Janita: '5-0', Hlaisani: null, Vuyolwethu: null, Tlamelo: '3-0',
      Thapedi: '6-0', Fikile: '5-0', Jereshan: '3-0', Happy: '3-1', Alone: '3-0',
      Dylan: '3-0', Nandipha: '2-0'
    }
  },
  {
    matchId: 'm15',
    predictions: {
      Sanjay: '1-1', Janita: '1-0', Hlaisani: '1-1', Vuyolwethu: null, Tlamelo: '1-1',
      Thapedi: '0-1', Fikile: '3-1', Jereshan: '1-1', Happy: '1-1', Alone: '1-0',
      Dylan: '0-1', Nandipha: '0-1'
    }
  },
  {
    matchId: 'm16',
    predictions: {
      Sanjay: '2-1', Janita: '2-1', Hlaisani: '3-1', Vuyolwethu: null, Tlamelo: '3-0',
      Thapedi: '1-1', Fikile: '2-1', Jereshan: '2-0', Happy: '3-2', Alone: '2-1',
      Dylan: '2-1', Nandipha: '1-1'
    }
  },
  {
    matchId: 'm17',
    predictions: {
      Sanjay: '3-2', Janita: '2-1', Hlaisani: '2-1', Vuyolwethu: null, Tlamelo: '3-0',
      Thapedi: '3-1', Fikile: '3-1', Jereshan: '2-0', Happy: '2-1', Alone: '3-0',
      Dylan: '3-1', Nandipha: '3-1'
    }
  },
  {
    matchId: 'm18',
    predictions: {
      Sanjay: '0-2', Janita: '0-3', Hlaisani: '1-4', Vuyolwethu: null, Tlamelo: '0-3',
      Thapedi: '0-2', Fikile: '0-3', Jereshan: '0-2', Happy: '1-2', Alone: '0-2',
      Dylan: '0-2', Nandipha: '0-2'
    }
  },
  {
    matchId: 'm19',
    predictions: {
      Sanjay: '4-0', Janita: '2-1', Hlaisani: '2-1', Vuyolwethu: null, Tlamelo: '3-0',
      Thapedi: '2-1', Fikile: '3-0', Jereshan: '2-0', Happy: '1-2', Alone: '2-0',
      Dylan: '1-2', Nandipha: '1-1'
    }
  },
  {
    matchId: 'm20',
    predictions: {
      Sanjay: '2-1', Janita: '2-0', Hlaisani: '2-0', Vuyolwethu: null, Tlamelo: '3-0',
      Thapedi: '1-0', Fikile: '2-0', Jereshan: '1-1', Happy: null, Alone: '3-0',
      Dylan: '2-0', Nandipha: '2-0'
    }
  },
  {
    matchId: 'm21',
    predictions: {
      Sanjay: '1-2', Janita: '1-1', Hlaisani: '2-0', Vuyolwethu: '2-0', Tlamelo: '1-3',
      Thapedi: '2-1', Fikile: '1-1', Jereshan: '1-0', Happy: '1-1', Alone: '1-1',
      Dylan: '1-0', Nandipha: '1-1'
    }
  },
  {
    matchId: 'm22',
    predictions: {
      Sanjay: '1-0', Janita: '2-1', Hlaisani: '2-2', Vuyolwethu: '2-1', Tlamelo: '2-2',
      Thapedi: '2-1', Fikile: '2-1', Jereshan: '2-1', Happy: '2-0', Alone: '1-0',
      Dylan: '1-1', Nandipha: '2-1'
    }
  },
  {
    matchId: 'm23',
    predictions: {
      Sanjay: '2-0', Janita: '2-0', Hlaisani: '2-0', Vuyolwethu: '3-0', Tlamelo: '2-0',
      Thapedi: '3-0', Fikile: '3-1', Jereshan: '3-1', Happy: null, Alone: '2-0',
      Dylan: '2-0', Nandipha: '3-1'
    }
  },
  {
    matchId: 'm24',
    predictions: {
      Sanjay: '0-1', Janita: '0-2', Hlaisani: '1-1', Vuyolwethu: '0-1', Tlamelo: '0-3',
      Thapedi: '1-2', Fikile: '0-2', Jereshan: '0-1', Happy: '1-3', Alone: '0-2',
      Dylan: '0-3', Nandipha: '0-1'
    }
  },
  {
    matchId: 'm25',
    predictions: {
      Sanjay: '0-0', Janita: '1-0', Hlaisani: '1-1', Vuyolwethu: null, Tlamelo: '1-2',
      Thapedi: '1-2', Fikile: '1-2', Jereshan: '0-1', Happy: '1-0', Alone: '0-1',
      Dylan: '0-1', Nandipha: '2-1'
    }
  },
  {
    matchId: 'm26',
    predictions: {
      Sanjay: '0-1', Janita: '2-1', Hlaisani: '2-1', Vuyolwethu: null, Tlamelo: '2-0',
      Thapedi: '2-1', Fikile: '2-0', Jereshan: '2-1', Happy: '2-1', Alone: '0-2',
      Dylan: '1-0', Nandipha: '2-1'
    }
  },
  {
    matchId: 'm27',
    predictions: {
      Sanjay: '2-0', Janita: '2-1', Hlaisani: '1-1', Vuyolwethu: null, Tlamelo: '0-0',
      Thapedi: '1-1', Fikile: '3-1', Jereshan: '2-1', Happy: '2-0', Alone: '2-1',
      Dylan: '2-0', Nandipha: '2-0'
    }
  },
  {
    matchId: 'm28',
    predictions: {
      Sanjay: '2-2', Janita: '2-2', Hlaisani: '2-2', Vuyolwethu: null, Tlamelo: '2-1',
      Thapedi: '1-3', Fikile: '2-1', Jereshan: '2-1', Happy: '2-1', Alone: '3-2',
      Dylan: '2-1', Nandipha: '2-1'
    }
  },
  {
    matchId: 'm29',
    predictions: {
      Sanjay: '2-1', Janita: '2-1', Hlaisani: '2-1', Vuyolwethu: null, Tlamelo: '3-1',
      Thapedi: '3-0', Fikile: '2-0', Jereshan: '2-0', Happy: '2-0', Alone: '2-0',
      Dylan: '3-1', Nandipha: '2-1'
    }
  },
  {
    matchId: 'm30',
    predictions: {
      Sanjay: '1-2', Janita: '1-2', Hlaisani: '0-2', Vuyolwethu: '0-0', Tlamelo: '0-2',
      Thapedi: '1-2', Fikile: '1-2', Jereshan: '1-2', Happy: '1-3', Alone: '0-1',
      Dylan: '1-1', Nandipha: null
    }
  },
  {
    matchId: 'm31',
    predictions: {
      Sanjay: '3-0', Janita: '3-1', Hlaisani: '3-0', Vuyolwethu: '2-0', Tlamelo: '4-0',
      Thapedi: '5-0', Fikile: '3-1', Jereshan: '4-0', Happy: '3-1', Alone: '3-0',
      Dylan: '4-0', Nandipha: null
    }
  },
  {
    matchId: 'm32',
    predictions: {
      Sanjay: '2-1', Janita: '1-0', Hlaisani: '2-1', Vuyolwethu: '1-3', Tlamelo: '2-1',
      Thapedi: '1-1', Fikile: '1-0', Jereshan: '2-0', Happy: '2-2', Alone: '2-1',
      Dylan: '2-1', Nandipha: null
    }
  },
  {
    matchId: 'm33',
    predictions: {
      Sanjay: '2-1', Janita: '2-1', Hlaisani: '3-1', Vuyolwethu: '2-0', Tlamelo: '2-0',
      Thapedi: '2-2', Fikile: '2-1', Jereshan: '2-1', Happy: '1-0', Alone: '0-0',
      Dylan: '2-1', Nandipha: null
    }
  },
  {
    matchId: 'm34',
    predictions: {
      Sanjay: '3-1', Janita: '2-0', Hlaisani: '2-1', Vuyolwethu: '2-0', Tlamelo: '3-0',
      Thapedi: '3-1', Fikile: '2-1', Jereshan: '4-1', Happy: '3-4', Alone: '3-1',
      Dylan: '3-1', Nandipha: null
    }
  },
  {
    matchId: 'm35',
    predictions: {
      Sanjay: '2-0', Janita: '1-1', Hlaisani: '3-1', Vuyolwethu: null, Tlamelo: '2-1',
      Thapedi: '2-0', Fikile: '2-0', Jereshan: '1-1', Happy: '1-0', Alone: '2-0',
      Dylan: '3-0', Nandipha: null
    }
  },
  {
    matchId: 'm36',
    predictions: {
      Sanjay: '1-2', Janita: '0-2', Hlaisani: '1-1', Vuyolwethu: null, Tlamelo: '1-2',
      Thapedi: '1-2', Fikile: '0-2', Jereshan: '1-0', Happy: '0-2', Alone: '1-2',
      Dylan: '0-3', Nandipha: null
    }
  },
  {
    matchId: 'm37',
    predictions: {
      Sanjay: '4-0', Janita: '3-0', Hlaisani: '3-0', Vuyolwethu: null, Tlamelo: '2-0',
      Thapedi: '4-0', Fikile: '3-0', Jereshan: '3-1', Happy: '3-1', Alone: '3-0',
      Dylan: '3-0', Nandipha: null
    }
  },
  {
    matchId: 'm38',
    predictions: {
      Sanjay: '2-1', Janita: '2-0', Hlaisani: '2-1', Vuyolwethu: null, Tlamelo: '3-0',
      Thapedi: '1-0', Fikile: '2-0', Jereshan: '2-1', Happy: '3-1', Alone: '2-1',
      Dylan: '2-0', Nandipha: null
    }
  },
  {
    matchId: 'm39',
    predictions: {
      Sanjay: '2-0', Janita: '2-0', Hlaisani: '0-0', Vuyolwethu: null, Tlamelo: '1-0',
      Thapedi: '1-1', Fikile: '1-0', Jereshan: '1-0', Happy: null, Alone: '2-0',
      Dylan: '0-1', Nandipha: null
    }
  },
  {
    matchId: 'm40',
    predictions: {
      Sanjay: '1-2', Janita: '0-3', Hlaisani: '2-2', Vuyolwethu: null, Tlamelo: '0-1',
      Thapedi: '1-1', Fikile: '1-1', Jereshan: '1-1', Happy: null, Alone: '1-1',
      Dylan: '1-2', Nandipha: null
    }
  },
  {
    matchId: 'm41',
    predictions: {
      Sanjay: '4-1', Janita: '2-0', Hlaisani: '3-1', Vuyolwethu: '3-0', Tlamelo: '4-0',
      Thapedi: '3-0', Fikile: '3-1', Jereshan: '3-0', Happy: '4-2', Alone: '2-0',
      Dylan: '3-1', Nandipha: '3-1'
    }
  },
  {
    matchId: 'm42',
    predictions: {
      Sanjay: '4-0', Janita: '4-0', Hlaisani: '5-0', Vuyolwethu: '2-0', Tlamelo: '4-0',
      Thapedi: '3-1', Fikile: '4-0', Jereshan: '4-0', Happy: '4-1', Alone: '3-0',
      Dylan: '4-0', Nandipha: '4-0'
    }
  },
  {
    matchId: 'm43',
    predictions: {
      Sanjay: '3-1', Janita: null, Hlaisani: '2-2', Vuyolwethu: '0-1', Tlamelo: '1-2',
      Thapedi: '1-0', Fikile: '2-1', Jereshan: '1-0', Happy: '1-2', Alone: '1-1',
      Dylan: '2-1', Nandipha: '1-1'
    }
  },
  {
    matchId: 'm44',
    predictions: {
      Sanjay: '2-0', Janita: null, Hlaisani: '1-4', Vuyolwethu: '0-2', Tlamelo: '0-3',
      Thapedi: '1-2', Fikile: '0-1', Jereshan: '0-1', Happy: '2-3', Alone: '1-3',
      Dylan: '0-1', Nandipha: '2-0'
    }
  }
];

// Actual scores when finished
export const MATCH_ACTUAL_RESULTS: { [matchId: string]: { home: number; away: number } } = {
  m1: { home: 2, away: 0 },
  m2: { home: 2, away: 1 },
  m3: { home: 1, away: 1 },
  m4: { home: 4, away: 1 },
  m5: { home: 0, away: 1 },
  m6: { home: 2, away: 0 },
  m7: { home: 1, away: 1 },
  m8: { home: 1, away: 1 },
  m9: { home: 1, away: 0 },
  m10: { home: 7, away: 1 },
  m11: { home: 2, away: 2 },
  m12: { home: 5, away: 1 },
  m13: { home: 1, away: 1 },
  m14: { home: 0, away: 0 },
  m15: { home: 2, away: 2 },
  m16: { home: 1, away: 1 },
  m17: { home: 3, away: 1 },
  m18: { home: 1, away: 4 },
  m19: { home: 3, away: 0 },
  m20: { home: 3, away: 1 },
  m21: { home: 1, away: 0 },
  m22: { home: 4, away: 2 },
  m23: { home: 1, away: 1 },
  m24: { home: 1, away: 3 },
  m25: { home: 1, away: 1 },
  m26: { home: 4, away: 1 },
  m27: { home: 6, away: 0 },
  m29: { home: 2, away: 0 },
  m30: { home: 0, away: 1 },
  m31: { home: 3, away: 0 },
  m32: { home: 0, away: 1 },
  m33: { home: 5, away: 1 },
  m34: { home: 2, away: 1 },
  m35: { home: 0, away: 0 },
  m36: { home: 0, away: 4 },
  m37: { home: 4, away: 0 },
  m38: { home: 0, away: 0 },
  m39: { home: 2, away: 2 },
  m40: { home: 1, away: 3 }
};
