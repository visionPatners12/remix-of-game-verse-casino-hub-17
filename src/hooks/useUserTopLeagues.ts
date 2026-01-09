import { useQuery } from '@tanstack/react-query';
import { supabase, sportsDataClient } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserTopLeague {
  id: string;
  league_name: string;
  logo_url: string | null;
  country_code: string | null;
  priority_order: number;
  sport_name: string;
  sport_icon: string;
  league_id: number;
}

export function useUserTopLeagues() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-top-leagues', user?.id],
    queryFn: async (): Promise<UserTopLeague[]> => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get favorite sports from user_preferences table
      const { data: favoriteSports, error: favoriteSportsError } = await supabase
        .from('user_preferences' as any)
        .select('sport_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'sport');

      if (favoriteSportsError) {
        throw favoriteSportsError;
      }

      const sportIds = (favoriteSports as any)?.map((fs: any) => fs.sport_id) || [];
      
      if (sportIds.length === 0) {
        return [];
      }

      // Get leagues for these sport IDs (using actual league table)
      const { data: leaguesData, error: leaguesError } = await sportsDataClient
        .from('league')
        .select('*')
        .in('sport_id', sportIds)
        .order('created_at', { ascending: false })
        .limit(10);

      if (leaguesError) {
        throw leaguesError;
      }

      if (!leaguesData || leaguesData.length === 0) {
        return [];
      }

      // Get unique sport IDs from leagues and fetch sport icons
      const uniqueSportIds = [...new Set((leaguesData || []).map((league: any) => league.sport_id))];

      const { data: sportsIcons, error: sportsError } = await sportsDataClient
        .from('sport')
        .select('id, icon_name, name')
        .in('id', uniqueSportIds);

      if (sportsError) {
        throw sportsError;
      }

      // Create a map for quick icon lookup
      const iconsMap = new Map((sportsIcons || []).map((sport: any) => [sport.id, { icon: sport.icon_name, name: sport.name }]));

      // Transform the data
      const transformedData = (leaguesData || []).map((league: any, index: number) => {
        const sportInfo = iconsMap.get(league.sport_id);
        return {
          id: league.id,
          league_name: league.name,
          logo_url: league.logo,
          country_code: null,
          priority_order: index + 1,
          sport_name: sportInfo?.name || '',
          sport_icon: sportInfo?.icon || '',
          league_id: league.highlightly_id || index,
        };
      });
      
      return transformedData;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
