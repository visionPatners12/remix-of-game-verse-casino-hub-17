// Tournament Types - Format Ludo 4 joueurs par match

export type TournamentSize = 16 | 64;

export type PrizeDistributionType = 'standard' | 'winner-takes-all' | 'top-heavy' | 'balanced';

export interface TournamentFormData {
  name: string;
  description: string;
  tournamentSize: TournamentSize;
  entryFee: number;
  commissionRate: number;
  registrationStart: Date;
  registrationEnd: Date;
  tournamentStart: Date | null;
  startWhenFull: boolean;
  prizeDistributionType: PrizeDistributionType;
}

export interface PrizeDistribution {
  position: number;
  percentage: number;
  amount: number;
}

export interface TournamentConfig {
  size: TournamentSize;
  playersPerMatch: 4;
  matchesRound1: number;
  totalMatches: number;
  rounds: number;
  roundNames: string[];
}

// Configuration des tournois basée sur le nombre de joueurs
// - 16 joueurs : 4 matchs de Quarts → 1 Finale (5 matchs, 2 rounds)
// - 64 joueurs : 16 matchs Round 1 → 4 Demi-finales → 1 Finale (21 matchs, 3 rounds)
export const TOURNAMENT_CONFIGS: Record<TournamentSize, TournamentConfig> = {
  16: {
    size: 16,
    playersPerMatch: 4,
    matchesRound1: 4,
    totalMatches: 5,
    rounds: 2,
    roundNames: ['Quarts de finale', 'Finale']
  },
  64: {
    size: 64,
    playersPerMatch: 4,
    matchesRound1: 16,
    totalMatches: 21,
    rounds: 3,
    roundNames: ['Premier tour', 'Demi-finales', 'Finale']
  }
};

export const DEFAULT_PRIZE_DISTRIBUTION: PrizeDistribution[] = [
  { position: 1, percentage: 60, amount: 0 },
  { position: 2, percentage: 25, amount: 0 },
  { position: 3, percentage: 7.5, amount: 0 },
  { position: 4, percentage: 7.5, amount: 0 }
];

export const PRIZE_DISTRIBUTIONS: Record<PrizeDistributionType, {
  name: string;
  emoji: string;
  description: string;
  distribution: PrizeDistribution[];
}> = {
  'standard': {
    name: 'Standard',
    emoji: '⚖️',
    description: '60 / 25 / 7.5 / 7.5',
    distribution: [
      { position: 1, percentage: 60, amount: 0 },
      { position: 2, percentage: 25, amount: 0 },
      { position: 3, percentage: 7.5, amount: 0 },
      { position: 4, percentage: 7.5, amount: 0 }
    ]
  },
  'winner-takes-all': {
    name: 'Winner Takes All',
    emoji: '👑',
    description: '100% au gagnant',
    distribution: [
      { position: 1, percentage: 100, amount: 0 }
    ]
  },
  'top-heavy': {
    name: 'Top Heavy',
    emoji: '🔥',
    description: '70 / 20 / 10',
    distribution: [
      { position: 1, percentage: 70, amount: 0 },
      { position: 2, percentage: 20, amount: 0 },
      { position: 3, percentage: 10, amount: 0 }
    ]
  },
  'balanced': {
    name: 'Équilibré',
    emoji: '🤝',
    description: '50 / 30 / 12 / 8',
    distribution: [
      { position: 1, percentage: 50, amount: 0 },
      { position: 2, percentage: 30, amount: 0 },
      { position: 3, percentage: 12, amount: 0 },
      { position: 4, percentage: 8, amount: 0 }
    ]
  }
};

export const DEFAULT_FORM_DATA: TournamentFormData = {
  name: '',
  description: '',
  tournamentSize: 16,
  entryFee: 5,
  commissionRate: 10,
  registrationStart: new Date(),
  registrationEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  tournamentStart: null,
  startWhenFull: true,
  prizeDistributionType: 'standard'
};
