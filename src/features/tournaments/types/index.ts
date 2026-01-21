// Tournament Types

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
  betPerMatch: 0
};
