import { useQuery } from '@tanstack/react-query';
import { supabase, sportsDataClient } from '@/integrations/supabase/client';
import { useMemo } from 'react';

// Team data from top_entities joined with teams table
interface TeamFromTopEntities {
  id: string;
  title: string;
  slug: string | null;
  logo: string | null;
  countryName: string | null;
  score: number | null;
}

// Sport data structure with its teams
export interface SportWithTeams {
  sportId: string;
  sportName: string;
  sportSlug: string;
  sportIconName: string | null;
  teamCount: number;
  teams: TeamFromTopEntities[];
}

export function useTopTeamsBySport() {
  const query = useQuery({
    queryKey: ['top-teams-by-sport'],
    queryFn: async (): Promise<SportWithTeams[]> => {
      try {
        // STEP 1: Fetch top_entities from public schema
        const { data: topEntitiesData, error: entitiesError } = await supabase
          .from('top_entities')
          .select('id, title, slug, logo, country_name, team_id, sport_id')
          .eq('entity_type', 'team')
          .order('created_at', { ascending: false });

        if (entitiesError) {
          console.error('Error fetching top entities:', entitiesError);
          throw entitiesError;
        }

        if (!topEntitiesData || topEntitiesData.length === 0) {
          return [];
        }

        // STEP 2: Extract unique IDs (type assertion needed due to outdated types)
        const entities = topEntitiesData as any[];
        const uniqueTeamIds = [...new Set(entities.map(e => e.team_id).filter(Boolean))];
        const uniqueSportIds = [...new Set(entities.map(e => e.sport_id))];

        // STEP 3: Fetch associated data in parallel from sports_data
        const [teamsResult, sportsResult] = await Promise.all([
          sportsDataClient
            .from('teams')
            .select('id, name, slug, logo, country_id(name)')
            .in('id', uniqueTeamIds),
          
          sportsDataClient
            .from('sport')
            .select('id, name, slug, icon_name')
            .in('id', uniqueSportIds)
        ]);

        if (teamsResult.error) {
          console.error('Error fetching teams:', teamsResult.error);
          throw teamsResult.error;
        }

        if (sportsResult.error) {
          console.error('Error fetching sports:', sportsResult.error);
          throw sportsResult.error;
        }

        // STEP 4: Create maps for fast lookup
        const teamsMap = new Map(
          (teamsResult.data || []).map(t => [t.id, t])
        );
        const sportsMap = new Map(
          (sportsResult.data || []).map(s => [s.id, s])
        );

        // STEP 5: Merge data and group by sport
        const sportMap = new Map<string, SportWithTeams>();

        entities.forEach((topEntity: any) => {
          const teamData = teamsMap.get(topEntity.team_id);
          const sportData = sportsMap.get(topEntity.sport_id);
          
          if (!teamData || !sportData) return;
          
          if (!sportMap.has(sportData.id)) {
            sportMap.set(sportData.id, {
              sportId: sportData.id,
              sportName: sportData.name,
              sportSlug: sportData.slug,
              sportIconName: sportData.icon_name || null,
              teamCount: 0,
              teams: [],
            });
          }
          
          const sport = sportMap.get(sportData.id)!;
          sport.teams.push({
            id: teamData.id,
            title: teamData.name,
            slug: teamData.slug,
            logo: teamData.logo || topEntity.logo,
            countryName: (teamData.country_id as any)?.name || topEntity.country_name || null,
            score: null,
          });
          sport.teamCount = sport.teams.length;
        });

        return Array.from(sportMap.values());
      } catch (error) {
        console.error('Error in useTopTeamsBySport:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return useMemo(() => ({
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error?.message || null,
    isStale: query.isStale,
  }), [query.data, query.isLoading, query.error, query.isStale]);
}