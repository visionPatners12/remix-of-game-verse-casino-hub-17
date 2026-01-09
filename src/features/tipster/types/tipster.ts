// Re-export core tipster types and add feature-specific ones
export * from '@/types/tipster';

// Dashboard specific types
export interface TipsterDashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  subscriberCount: number;
  winRate: number;
  totalTips: number;
  activeTips: number;
  recentPerformance: PerformanceData[];
}

export interface PerformanceData {
  period: string;
  tips: number;
  won: number;
  rate: number;
}

export interface TipsterSubscriber {
  id: string;
  name: string;
  username: string;
  avatar: string;
  subscriptionDate: string;
  status: 'active' | 'inactive' | 'expired';
  lastActivity: string;
  totalBets: number;
  wonBets: number;
}

// Setup form types
export interface TipsterSetupFormData {
  monthly_price: string;
  description: string;
  specialties: string[];
  experience: string;
}

// Leaderboard types
export type SortField = 'yield' | 'tips' | 'avgOdds' | 'form' | 'openTips' | 'winRate';
export type SortDirection = 'asc' | 'desc';

export interface LeaderboardFilters {
  searchTerm: string;
  sortBy: SortField;
  sortDirection: SortDirection;
  selectedSport: string;
}