import { supabase, socialClient, sportsDataClient } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface PredictionWithSelections {
  id: string;
  user_id: string;
  analysis: string;
  confidence: number;
  hashtags: string[];
  visibility: 'public' | 'private';
  status: string;
  created_at: string;
  stream_activity_id: string | null;
  
  // User data
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  
  // Selections avec enrichissement
  selections: Array<{
    id: string;
    market_type: string;
    pick: string;
    odds: number;
    condition_id: string;
    outcome_id: string;
    
    // Match data enrichi
    match: {
      id: string | null;
      homeName: string;
      awayName: string;
      homeImage: string | null;
      awayImage: string | null;
      date: string;
      league: string;
      sport: string;
    };
  }>;
}

export class PredictionService {
  /**
   * Récupérer les predictions publiques avec enrichissement complet
   */
  static async getPublicPredictions(limit = 20): Promise<PredictionWithSelections[]> {
    try {
      // 1. Fetch predictions depuis social_post.predictions
      const { data: predictions, error: predError } = await socialClient
        .from('predictions')
        .select(`
          id,
          user_id,
          analysis,
          confidence,
          hashtags,
          visibility,
          status,
          created_at,
          stream_activity_id
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (predError) {
        logger.error('Failed to fetch predictions', predError);
        throw new Error('Failed to fetch predictions');
      }
      
      if (!predictions || predictions.length === 0) {
        return [];
      }
      
      // 2. Récupérer les user_ids uniques
      const userIds = [...new Set(predictions.map(p => p.user_id))];
      
      // 3. Fetch users depuis public.users
      const { data: users } = await supabase
        .from('users')
        .select('id, username, first_name, last_name, avatar_url')
        .in('id', userIds);
      
      const usersMap = new Map(users?.map(u => [u.id, u]) || []);
      
      // 4. Pour chaque prediction, fetch selections + enrichissement
      const enrichedPredictions = await Promise.all(
        predictions.map(async (pred) => {
          // Fetch selections
          const { data: selections } = await socialClient
            .from('selections')
            .select('*')
            .eq('prediction_id', pred.id);
          
          if (!selections || selections.length === 0) {
            return null; // Skip si pas de sélections
          }
          
          // Enrichir chaque sélection
          const enrichedSelections = await Promise.all(
            selections.map(async (sel) => {
              // Parser match_data (JSONB)
              const matchData = (sel.match_data as any) || {};
              
              // Enrichir avec teams si on a les IDs
              let homeImage = null, awayImage = null;
              if (sel.home_team_id && sel.away_team_id) {
                const { data: teams } = await sportsDataClient
                  .from('teams')
                  .select('id, logo')
                  .in('id', [sel.home_team_id, sel.away_team_id]);
                
                const homeTeam = teams?.find(t => t.id === sel.home_team_id);
                const awayTeam = teams?.find(t => t.id === sel.away_team_id);
                
                homeImage = homeTeam?.logo || null;
                awayImage = awayTeam?.logo || null;
              }
              
              return {
                id: sel.id,
                market_type: sel.market_type,
                pick: sel.pick,
                odds: Number(sel.odds),
                condition_id: sel.condition_id,
                outcome_id: sel.outcome_id,
                match: {
                  id: sel.match_id,
                  homeName: matchData.homeTeam || matchData.participants?.[0]?.name || 'Unknown',
                  awayName: matchData.awayTeam || matchData.participants?.[1]?.name || 'Unknown',
                  homeImage,
                  awayImage,
                  date: matchData.date || new Date().toISOString(),
                  league: matchData.league || 'Unknown League',
                  sport: matchData.sport || 'Unknown Sport'
                }
              };
            })
          );
          
          const user = usersMap.get(pred.user_id);
          
          return {
            ...pred,
            user: user || {
              id: pred.user_id,
              username: 'unknown',
              first_name: 'Unknown',
              last_name: 'User',
              avatar_url: '/placeholder.svg'
            },
            selections: enrichedSelections
          };
        })
      );
      
      // Filtrer les null (predictions sans sélections)
      return enrichedPredictions.filter(p => p !== null) as PredictionWithSelections[];
    } catch (error) {
      logger.error('PredictionService.getPublicPredictions error', error);
      return [];
    }
  }
  
  /**
   * Récupérer les predictions d'un utilisateur spécifique
   */
  static async getUserPredictions(userId: string, limit = 50): Promise<PredictionWithSelections[]> {
    try {
      // Même logique que getPublicPredictions mais filtré par user_id
      const { data: predictions, error: predError } = await socialClient
        .from('predictions')
        .select(`
          id,
          user_id,
          analysis,
          confidence,
          hashtags,
          visibility,
          status,
          created_at,
          stream_activity_id
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (predError) {
        logger.error('Failed to fetch user predictions', predError);
        throw new Error('Failed to fetch user predictions');
      }
      
      if (!predictions || predictions.length === 0) {
        return [];
      }
      
      // Fetch user info
      const { data: user } = await supabase
        .from('users')
        .select('id, username, first_name, last_name, avatar_url')
        .eq('id', userId)
        .single();
      
      const userInfo = user || {
        id: userId,
        username: 'unknown',
        first_name: 'Unknown',
        last_name: 'User',
        avatar_url: '/placeholder.svg'
      };
      
      // Pour chaque prediction, fetch selections + enrichissement
      const enrichedPredictions = await Promise.all(
        predictions.map(async (pred) => {
          const { data: selections } = await socialClient
            .from('selections')
            .select('*')
            .eq('prediction_id', pred.id);
          
          if (!selections || selections.length === 0) {
            return null;
          }
          
          const enrichedSelections = await Promise.all(
            selections.map(async (sel) => {
              const matchData = (sel.match_data as any) || {};
              
              let homeImage = null, awayImage = null;
              if (sel.home_team_id && sel.away_team_id) {
                const { data: teams } = await sportsDataClient
                  .from('teams')
                  .select('id, logo')
                  .in('id', [sel.home_team_id, sel.away_team_id]);
                
                const homeTeam = teams?.find(t => t.id === sel.home_team_id);
                const awayTeam = teams?.find(t => t.id === sel.away_team_id);
                
                homeImage = homeTeam?.logo || null;
                awayImage = awayTeam?.logo || null;
              }
              
              return {
                id: sel.id,
                market_type: sel.market_type,
                pick: sel.pick,
                odds: Number(sel.odds),
                condition_id: sel.condition_id,
                outcome_id: sel.outcome_id,
                match: {
                  id: sel.match_id,
                  homeName: matchData.homeTeam || matchData.participants?.[0]?.name || 'Unknown',
                  awayName: matchData.awayTeam || matchData.participants?.[1]?.name || 'Unknown',
                  homeImage,
                  awayImage,
                  date: matchData.date || new Date().toISOString(),
                  league: matchData.league || 'Unknown League',
                  sport: matchData.sport || 'Unknown Sport'
                }
              };
            })
          );
          
          return {
            ...pred,
            user: userInfo,
            selections: enrichedSelections
          };
        })
      );
      
      return enrichedPredictions.filter(p => p !== null) as PredictionWithSelections[];
    } catch (error) {
      logger.error('PredictionService.getUserPredictions error', error);
      return [];
    }
  }
}
