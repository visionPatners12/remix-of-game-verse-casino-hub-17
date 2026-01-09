// Re-export core tipster types and add feature-specific ones
export * from '@/types/tipster';

// TipsterProfile with specialties as UUIDs array
export interface TipsterProfile {
  id: string;
  user_id: string;
  monthly_price: number;
  description: string;
  specialties?: string[] | null;
  experience?: string | null;
  tips_won?: number | null;
  tips_total?: number | null;
  avg_odds?: number | null;
  yield_pct?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  split_contract_address?: string | null;
  specialty_names?: { id: string; name: string; slug: string; }[] | null;
}

export interface CreateTipsterData {
  user_id: string;
  monthly_price: number;
  description: string;
  specialties?: string[];
  experience?: string;
}

export interface UpdateTipsterData {
  monthly_price?: number;
  description?: string;
  specialties?: string[];
  experience?: string;
}

export interface TipsterStats {
  id: string;
  username: string;
  name: string;
  avatar: string;
  verified: boolean;
  rank: number;
  yield: number;           // In %
  totalTips: number;       // = resolved
  wins: number;
  avgOdds: number;
  form: ('W' | 'L')[];
  openTips: number;        // = open
  winRate: number;         // In %
  streak: number;
  country: string;
  level: number;
  followers: number;
}

export interface TipsterCardProps {
  tipster: TipsterStats;
  onClick?: (tipster: TipsterStats) => void;
  variant?: 'default' | 'compact' | 'detailed' | 'horizontal';
  className?: string;
}

export interface TipsterLeaderboardProps {
  tipsters: TipsterStats[];
  onTipsterClick?: (tipster: TipsterStats) => void;
  variant?: 'grid' | 'list';
  className?: string;
}