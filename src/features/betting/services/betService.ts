import { socialClient } from '@/integrations/supabase/client';
import type { Bet, CreateBetData, BetFilters, BetRow } from '../types/bet';

// Helper function to convert database row to application type
function transformBetRow(row: any): Bet {
  return {
    ...row,
    selections: typeof row.selections === 'string' 
      ? JSON.parse(row.selections) 
      : row.selections
  };
}

export class BetService {
  /**
   * Create a new bet
   */
  static async createBet(data: CreateBetData): Promise<{ data: Bet | null; error: any }> {
    try {
      // Get current user
      const { data: { user } } = await socialClient.auth.getUser();
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      // Prepare data with user_id
      const betData = {
        ...data,
        user_id: user.id,
        selections: JSON.stringify(data.selections)
      };

      const { data: bet, error } = await socialClient
        .from('bets')
        .insert([betData])
        .select()
        .single();

      if (error) return { data: null, error };

      return { data: transformBetRow(bet), error: null };
    } catch (error) {
      console.error('Error creating bet:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's bet history
   */
  static async getUserBets(filters?: BetFilters): Promise<{ data: Bet[] | null; error: any }> {
    try {
      let query = socialClient
        .from('bets')
        .select(`
          *,
          matches (
            id,
            home_team_id,
            away_team_id,
            starts_at,
            sport_id
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.bet_type) {
        query = query.eq('bet_type', filters.bet_type);
      }
      
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      
      if (filters?.is_shared !== undefined) {
        query = query.eq('is_shared', filters.is_shared);
      }

      const { data, error } = await query;
      if (error) return { data: null, error };
      
      const transformedData = data?.map(transformBetRow) || null;
      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching user bets:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single bet by ID
   */
  static async getBetById(betId: string): Promise<{ data: Bet | null; error: any }> {
    try {
      const { data, error } = await socialClient
        .from('bets')
        .select(`
          *,
          matches (
            id,
            home_team_id,
            away_team_id,
            starts_at,
            sport_id
          )
        `)
        .eq('id', betId)
        .single();

      if (error) return { data: null, error };
      
      return { data: transformBetRow(data), error: null };
    } catch (error) {
      console.error('Error fetching bet:', error);
      return { data: null, error };
    }
  }

  /**
   * Update bet status (for settlement)
   */
  static async updateBetStatus(
    betId: string, 
    status: Bet['status'], 
    actualWin?: number
  ): Promise<{ data: Bet | null; error: any }> {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (actualWin !== undefined) {
        updateData.actual_win = actualWin;
      }

      if (status === 'won' || status === 'lost') {
        updateData.settled_at = new Date().toISOString();
      }

      const { data, error } = await socialClient
        .from('bets')
        .update(updateData)
        .eq('id', betId)
        .select()
        .single();

      if (error) return { data: null, error };
      
      return { data: transformBetRow(data), error: null };
    } catch (error) {
      console.error('Error updating bet status:', error);
      return { data: null, error };
    }
  }

  /**
   * Get shared bets (public feed)
   */
  static async getSharedBets(limit = 20): Promise<{ data: Bet[] | null; error: any }> {
    try {
      const { data, error } = await socialClient
        .from('bets')
        .select(`
          *,
          matches (
            id,
            home_team_id,
            away_team_id,
            starts_at,
            sport_id
          ),
          users (
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('is_shared', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return { data: null, error };
      
      const transformedData = data?.map(transformBetRow) || null;
      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching shared bets:', error);
      return { data: null, error };
    }
  }

  /**
   * Get public bets for a specific user
   */
  static async getPublicUserBets(userId: string, limit = 50): Promise<{ data: Bet[] | null; error: any }> {
    try {
      const { data, error } = await socialClient
        .from('bets')
        .select(`
          *,
          matches (
            id,
            home_team_id,
            away_team_id,
            starts_at,
            sport_id
          ),
          users (
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .eq('is_shared', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return { data: null, error };
      
      const transformedData = data?.map(transformBetRow) || null;
      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching user bets:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user betting statistics
   */
  static async getUserBettingStats(): Promise<{
    data: {
      total_bets: number;
      won_bets: number;
      lost_bets: number;
      pending_bets: number;
      total_staked: number;
      total_won: number;
      win_rate: number;
      roi: number;
    } | null; 
    error: any 
  }> {
    try {
      const { data: bets, error } = await socialClient
        .from('bets')
        .select('amount, actual_win, status');

      if (error) return { data: null, error };

      const stats = bets.reduce((acc, bet) => {
        acc.total_bets++;
        acc.total_staked += bet.amount;
        
        if (bet.status === 'won') {
          acc.won_bets++;
          acc.total_won += bet.actual_win;
        } else if (bet.status === 'lost') {
          acc.lost_bets++;
        } else if (bet.status === 'pending') {
          acc.pending_bets++;
        }
        
        return acc;
      }, {
        total_bets: 0,
        won_bets: 0,
        lost_bets: 0,
        pending_bets: 0,
        total_staked: 0,
        total_won: 0
      });

      const settledBets = stats.won_bets + stats.lost_bets;
      const win_rate = settledBets > 0 ? (stats.won_bets / settledBets) * 100 : 0;
      const roi = stats.total_staked > 0 ? ((stats.total_won - stats.total_staked) / stats.total_staked) * 100 : 0;

      return {
        data: {
          ...stats,
          win_rate,
          roi
        },
        error: null
      };
    } catch (error) {
      console.error('Error calculating betting stats:', error);
      return { data: null, error };
    }
  }
}