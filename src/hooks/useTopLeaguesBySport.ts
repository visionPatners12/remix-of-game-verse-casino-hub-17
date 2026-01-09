import { useQuery } from '@tanstack/react-query';
import { supabase, sportsDataClient } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface LeagueFromTopEntities {
  id: string;
  title: string;
  slug: string;
  logo?: string;
  countryName?: string;
}

export interface SportWithLeagues {
  sportId: string;
  sportName: string;
  sportSlug: string;
  sportIconName?: string;
  leagueCount: number;
  leagues: LeagueFromTopEntities[];
}

export function useTopLeaguesBySport() {
  return useQuery({
    queryKey: ['top-leagues-by-sport'],
    queryFn: async (): Promise<SportWithLeagues[]> => {
      try {
        logger.debug('useTopLeaguesBySport - Fetching leagues from top_entities');
        
        // STEP 1: Fetch leagues from public.top_entities
        const { data: topLeagues, error } = await supabase
          .from('top_entities')
          .select('id, title, slug, country_name, logo, sport_id, league_id')
          .eq('entity_type', 'league')
          .order('created_at', { ascending: false });

        if (error) {
          logger.error('Error fetching top leagues:', error);
          throw error;
        }

        if (!topLeagues || topLeagues.length === 0) {
          logger.debug('No top leagues found');
          return [];
        }

        // STEP 2: Fetch corresponding sports from sports_data.sport
        const sportIds = [...new Set(topLeagues.map(l => l.sport_id))];
        
        logger.debug('useTopLeaguesBySport - Fetching sports:', { sportIds });
        
        const { data: sports, error: sportsError } = await sportsDataClient
          .from('sport')
          .select('id, name, slug, icon_name')
          .in('id', sportIds);

        if (sportsError) {
          logger.error('Error fetching sports:', sportsError);
          throw sportsError;
        }

        if (!sports || sports.length === 0) {
          logger.warn('No sports found for sport_ids:', sportIds);
          return [];
        }

        // STEP 3: Create a map of sports for fast lookup
        const sportsMapLookup = new Map(sports.map(s => [s.id, s]));

        // STEP 4: Group leagues by sport
        const sportsMap = new Map<string, SportWithLeagues>();

        topLeagues.forEach((league: any) => {
          const sport = sportsMapLookup.get(league.sport_id);
          
          if (!sport) {
            logger.warn(`Sport not found for league ${league.id} with sport_id ${league.sport_id}`);
            return;
          }

          const sportId = sport.id;

          if (!sportsMap.has(sportId)) {
            sportsMap.set(sportId, {
              sportId,
              sportName: sport.name,
              sportSlug: sport.slug,
              sportIconName: sport.icon_name,
              leagueCount: 0,
              leagues: [],
            });
          }

          const sportWithLeagues = sportsMap.get(sportId)!;
          sportWithLeagues.leagues.push({
            id: league.league_id, // ✅ Use league_id (foreign key to sports_data.league)
            title: league.title,
            slug: league.slug || '',
            logo: league.logo,
            countryName: league.country_name,
          });
          sportWithLeagues.leagueCount++;
        });

        const result = Array.from(sportsMap.values())
          .sort((a, b) => b.leagueCount - a.leagueCount);

        logger.debug('useTopLeaguesBySport - Result:', { 
          sportsCount: result.length,
          totalLeagues: result.reduce((sum, s) => sum + s.leagueCount, 0)
        });
        
        return result;
      } catch (err) {
        logger.error('Error in useTopLeaguesBySport:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}