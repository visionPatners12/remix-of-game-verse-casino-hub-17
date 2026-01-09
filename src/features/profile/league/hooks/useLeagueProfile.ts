import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { logger } from '@/utils/logger';
import type { LeagueProfileData } from '../types/index';

export function useLeagueProfile(leagueId: string) {
  return useQuery({
    queryKey: ['league-profile', leagueId],
    queryFn: async (): Promise<LeagueProfileData | null> => {
      try {
        logger.debug('useLeagueProfile - Fetching league:', leagueId);
        
        const { data, error } = await sportsDataClient
          .from('league')
          .select(`
            id,
            name,
            display_name,
            slug,
            logo,
            highlightly_id,
            country:country_id (
              name,
              slug
            ),
            sport:sport_id (
              slug,
              name
            )
          `)
          .eq('id', leagueId)
          .maybeSingle();

        if (error) {
          logger.error('Error fetching league profile:', error);
          throw error;
        }

        if (!data) {
          logger.debug('No league found for id:', leagueId);
          return null;
        }

        // Transform the data to match LeagueProfileData interface
        const transformedData: LeagueProfileData = {
          id: data.id,
          name: data.display_name || data.name,
          slug: data.slug,
          logo: data.logo || '',
          logo_url: data.logo || '',
          country_name: (data.country as any)?.name || '',
          country_slug: (data.country as any)?.slug,
          sport_slug: (data.sport as any)?.slug || '',
          sport_name: (data.sport as any)?.name || '',
          highlightly_id: data.highlightly_id || undefined,
          season: '2024/25'
        };

        logger.debug('useLeagueProfile - League found:', transformedData);
        return transformedData;
      } catch (err) {
        logger.error('Error in useLeagueProfile:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!leagueId,
  });
}
