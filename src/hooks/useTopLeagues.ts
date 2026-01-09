import { useState, useEffect, useMemo } from 'react';
import { supabase, sportsDataClient } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface TopLeague {
  id: string;
  league_id: number;
  sport_id: number;
  priority_order: number;
  is_featured: boolean;
  name?: string;
  logo_url?: string;
  country_code?: string;
}

export function useTopLeagues(sportIds?: number[]) {
  const [leagues, setLeagues] = useState<TopLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabilize sportIds to prevent unnecessary re-fetches
  const stableSportIds = useMemo(() => {
    if (!sportIds || sportIds.length === 0) return [];
    // Sort to ensure consistent array reference
    return [...sportIds].sort((a, b) => a - b);
  }, [sportIds]);

  useEffect(() => {
    const fetchTopLeagues = async () => {
      try {
        setLoading(true);
        setError(null);
        
        logger.debug('useTopLeagues - Fetching for sports:', stableSportIds);
        
        // Since top_leagues table doesn't exist, use league table instead
        let query = sportsDataClient
          .from('league')
          .select('*');

        // Filter by sports if provided
        if (stableSportIds.length > 0) {
          // Convert string IDs to match sport_id format
          const sportUuids = await sportsDataClient
            .from('sport')
            .select('id')
            .in('azuro_id', stableSportIds);
          
          if (sportUuids.data && sportUuids.data.length > 0) {
            const uuids = sportUuids.data.map(s => s.id);
            query = query.in('sport_id', uuids);
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(10);

        if (error) {
          throw error;
        }

        // Transform data to match expected format
        const transformedData = (data || []).map((league, index) => ({
          id: league.id,
          league_id: league.highlightly_id || index,
          sport_id: 1, // Mock sport ID
          priority_order: index + 1,
          is_featured: true,
          name: league.name,
          logo_url: league.logo,
          country_code: null
        }));

        logger.debug('useTopLeagues - Fetched leagues:', { count: transformedData.length, sportIds: stableSportIds });
        setLeagues(transformedData);
      } catch (err) {
        logger.error('Error fetching top leagues:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLeagues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopLeagues();
  }, [stableSportIds]);

  return { leagues, loading, error };
}