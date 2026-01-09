// Complete tip types based on the provided JSON structure

interface TipSelection {
  marketType: string;
  pick: string;
  odds: number;
  conditionId: string;
  outcomeId: string;
}

interface TipMatch {
  id: string;
  date: string;
  homeId: string;
  homeName: string;
  awayId: string;
  awayName: string;
  league: string;
  leagueId: string;
}

interface TipUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export interface CompleteTip {
  verb: 'predict';
  object: string; // matchId
  time: string;
  selectionId: string;
  selection: TipSelection;
  analysis: string;
  confidence: number; // 0-100
  followers_count: number;
  hashtags: string[];
  match: TipMatch;
  user: TipUser;
  betAmount?: number;
  currency?: 'USD' | 'EUR' | 'STX';
}

export interface ClassicPrediction {
  verb: 'predict';
  object: string; // matchId
  time: string;
  selectionId: string;
  selection: TipSelection;
  analysis: string;
  confidence: number; // 0-100
  hashtags: string[];
  match: TipMatch;
  user: TipUser;
  betAmount?: number;
  currency?: 'USD' | 'EUR' | 'STX';
}

// Helper function to get confidence level
export function getConfidenceLevel(confidence: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (confidence >= 80) {
    return {
      label: 'Élevée',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    };
  } else if (confidence >= 60) {
    return {
      label: 'Modérée',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    };
  } else {
    return {
      label: 'Faible',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    };
  }
}

// Helper function to calculate potential win
function calculatePotentialWin(betAmount: number, odds: number): number {
  return betAmount * odds;
}

// Helper function to format currency
function formatCurrency(amount: number, currency: 'USD' | 'EUR' | 'STX' = 'EUR'): string {
  const symbols = {
    USD: '$',
    EUR: '€',
    STX: 'STX'
  };
  
  if (currency === 'STX') {
    return `${amount.toFixed(2)} ${symbols[currency]}`;
  }
  
  return `${amount.toFixed(2)}${symbols[currency]}`;
}