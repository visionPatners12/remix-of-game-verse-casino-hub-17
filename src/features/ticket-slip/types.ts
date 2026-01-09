import type { Selection as AzuroSelection } from '@azuro-org/toolkit';

export type BetMode = 'REGULAR' | 'AGAINST_PLAYER';
export type Currency = 'USDT';

export interface Selection extends Partial<AzuroSelection> {
  id: string;
  eventName: string;
  marketType: string;
  pick: string;
  odds: number;
  customOdds?: number; // Pour les cotes modifiées en mode AGAINST_PLAYER
  logoUrl?: string;
  participantImages?: string[];
  participants?: Array<{ name: string; image?: string | null }>; // Données des participants
  state?: string; // État de la condition (Active, Stopped, etc.)
  gameId?: string; // GameId pour la navigation vers les détails du match
  outcomeId: string; // Required for Azuro compatibility
  conditionId: string; // Required for Azuro compatibility
  sport?: {
    name: string;
    slug: string;
  };
  league?: {
    name: string;
    slug: string;
    logo?: string;
  };
  startsAt?: number;
}


export interface TicketSlipState {
  mode: BetMode;
  currency: Currency;
  stake: number;
  persistentBet: boolean;
  socialShare: boolean;
}

export interface FinancialCalculations {
  totalOdds: number;
  potentialPayout: number;
  maxPayout: number;
  minBet: number;
  xpEarned: number;
  bonusMultiplier: number;
  houseCommission?: number; // Commission de 5% pour AGAINST_PLAYER
  netPayout?: number; // Payout après commission
  netProfit?: number; // Profit après commission
}