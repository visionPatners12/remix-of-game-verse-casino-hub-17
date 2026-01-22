// Tournament Types

export type PrizeDistributionType = 'standard' | 'winner-takes-all' | 'top-heavy' | 'balanced';

export interface TournamentFormData {
  name: string;
  description: string;
  bracketSize: 4 | 8 | 16 | 32;
  entryFee: number;
  commissionRate: number;
  registrationStart: Date;
  registrationEnd: Date;
  tournamentStart: Date | null;
  startWhenFull: boolean;
  extraTurnOnSix: boolean;
  betPerMatch: number;
  prizeDistributionType: PrizeDistributionType;
}

export interface PrizeDistribution {
  position: number;
  percentage: number;
  amount: number;
}

export interface BracketConfig {
  size: 4 | 8 | 16 | 32;
  rounds: number;
  roundNames: string[];
}

export const BRACKET_CONFIGS: Record<4 | 8 | 16 | 32, BracketConfig> = {
  4: {
    size: 4,
    rounds: 2,
    roundNames: ['Semi-Finals', 'Final']
  },
  8: {
    size: 8,
    rounds: 3,
    roundNames: ['Quarter-Finals', 'Semi-Finals', 'Final']
  },
  16: {
    size: 16,
    rounds: 4,
    roundNames: ['Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Final']
  },
  32: {
    size: 32,
    rounds: 5,
    roundNames: ['Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Final']
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
    description: '100% to winner',
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
    name: 'Balanced',
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
  bracketSize: 8,
  entryFee: 5,
  commissionRate: 10,
  registrationStart: new Date(),
  registrationEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  tournamentStart: null,
  startWhenFull: true,
  extraTurnOnSix: true,
  betPerMatch: 0,
  prizeDistributionType: 'standard'
};
