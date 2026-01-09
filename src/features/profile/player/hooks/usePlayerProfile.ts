import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { supabase } from '@/integrations/supabase/client';
import { Player, PlayerStats, Rumours, NewsArticle, MarketValuePoint, Transfer } from '../types/player';
import { logger } from '@/utils/logger';

export function usePlayerProfile(playerId: string) {
  const { data: player, isLoading: playerLoading, error: playerError } = useQuery({
    queryKey: ['player-profile', playerId],
    queryFn: async (): Promise<Player | null> => {
      if (!playerId) return null;

      logger.debug('usePlayerProfile - Fetching player:', playerId);

      const { data, error } = await sportsDataClient
        .from('players')
        .select('*, sport:sport(slug)')
        .eq('id', playerId)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching player profile:', error);
        throw error;
      }

      if (!data) {
        logger.debug('No player found for id:', playerId);
        return null;
      }

      // Transform real data to match Player interface
      const profile = data.profile as any || {};
      const sportData = data.sport as any;
      const sportSlug = sportData?.slug || data.sport || 'football';
      
      // Parse Football-specific data
      const rumours = data.rumours as Rumours | undefined;
      const relatedNews = data.related_news as NewsArticle[] | undefined;
      const marketValue = data.market_value as MarketValuePoint[] | undefined;
      const transfers = data.transfers as Transfer[] | undefined;
      
      // Use team logo as fallback when player logo is null
      const teamLogo = profile?.team?.logo;
      const playerLogo = data.logo || teamLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&size=200&background=random`;
      
      return {
        id: data.id,  // UUID string
        name: data.name || undefined,  // Short name
        fullName: data.full_name,
        logo: playerLogo,
        sportSlug,
        rumours,
        relatedNews,
        marketValue,
        transfers,
        profile: {
          fullName: data.full_name,
          birthPlace: profile.birthPlace || 'Unknown',
          birthDate: profile.birthDate || 'Unknown',
          height: profile.height || 'N/A',
          jersey: profile.jersey || '-',
          weight: profile.weight || 'N/A',
          isActive: profile.isActive !== false,
          foot: profile.foot,
          citizenship: profile.citizenship,
          position: {
            main: profile.position?.main || 'Unknown',
            abbreviation: profile.position?.abbreviation || '-',
            secondary: profile.position?.secondary,
          },
          draft: profile.draft || {
            round: 0,
            year: 0,
            pick: 0
          },
          team: profile.team || {
            id: 0,
            logo: '',
            name: 'Free Agent',
            league: data.sport || 'N/A',
            displayName: 'Free Agent',
            abbreviation: 'FA'
          },
          club: profile.club,
        }
      };
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['player-stats', playerId, player?.profile?.team?.league],
    queryFn: async (): Promise<PlayerStats | null> => {
      if (!playerId) return null;
      if (!player) return null;

      logger.debug('usePlayerProfile - Fetching stats via edge function:', playerId);

      // Call edge function to get stats (handles caching)
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'fetch-player-stats',
        {
          body: {
            playerId: playerId,
            sport: player.sportSlug?.toLowerCase() || 'basketball',
            forceRefresh: false,
          }
        }
      );

      if (functionError) {
        logger.error('Error fetching player stats from edge function:', functionError);
        return null;
      }

      if (!functionData || !functionData.data) {
        logger.debug('No stats data returned from edge function');
        return {
          id: playerId,  // UUID string
          fullName: player.fullName,
          logo: player.logo,
          perSeason: [],
        };
      }

      const isFootball = ['football', 'soccer'].includes(player.sportSlug?.toLowerCase() || '');
      
      logger.debug('Stats fetched successfully:', {
        source: functionData.source,
        lastFetched: functionData.lastFetched,
        cacheAge: functionData.cacheAgeHours,
        isFootball,
        sport: functionData.sport,
      });

      // Handle different data structures based on sport
      if (isFootball && functionData.data?.perCompetition) {
        return {
          id: playerId,
          fullName: player.fullName,
          logo: player.logo,
          perCompetition: functionData.data.perCompetition || [],
          perClub: functionData.data.perClub || [],
          lastFetched: functionData.lastFetched,
          source: functionData.source,
          cacheAgeHours: functionData.cacheAgeHours,
        };
      }

      // NBA/Basketball format
      return {
        id: playerId,
        fullName: player.fullName,
        logo: player.logo,
        perSeason: Array.isArray(functionData.data) ? functionData.data : [],
        lastFetched: functionData.lastFetched,
        source: functionData.source,
        cacheAgeHours: functionData.cacheAgeHours,
      };
    },
    enabled: !!playerId && !!player,
    staleTime: 24 * 60 * 60 * 1000, // 24h - align with backend cache
  });

  return {
    player,
    stats,
    isLoading: playerLoading || statsLoading,
    error: playerError
  };
}
