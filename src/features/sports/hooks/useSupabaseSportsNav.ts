import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { SPORTS_MAPPING } from '../constants/sportsMapping';
import { IconType } from 'react-icons';

interface SportWithCounts {
  id: string;
  slug: string;
  name: string;
  icon: IconType;
  count: number;
  liveCount: number;
  prematchCount: number;
  isFavorite: boolean;
}

/**
 * Hook to fetch sports navigation data from stg_azuro_games
 * Replaces useSportsWithCounts by using Supabase instead of Azuro SDK
 * Now also fetches user favorites and sorts them first
 */
interface UseSportsWithCountsProps {
  isLive?: boolean;
  matchCounts?: Record<string, { total: number; live: number; prematch: number }>;
}

export function useSupabaseSportsNav({ isLive, matchCounts }: UseSportsWithCountsProps = {}) {
  const { user } = useAuth();

  // 1. Query pour récupérer la liste des sports
  const { data: rawSports = [], isLoading, error } = useQuery({
    queryKey: ['sports-nav-supabase', isLive],
    queryFn: async () => {
      const { data: sportsData, error: sportsError } = await sportsDataClient
        .from('sport')
        .select('id, name, slug, icon_name, azuro_id')
        .order('display_order', { ascending: true });

      if (sportsError) {
        console.error('Error fetching sports:', sportsError);
        throw sportsError;
      }

      return sportsData || [];
    },
    staleTime: isLive ? 15_000 : 60_000,
    gcTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // 2. Query pour récupérer les sports favoris de l'utilisateur (cache long)
  const { data: favoriteSportIds = [] } = useQuery({
    queryKey: ['favorite-sports-ids', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error: favError } = await supabase
        .from('user_preferences')
        .select('sport_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'sport')
        .not('sport_id', 'is', null);
      
      if (favError) {
        console.error('Error fetching favorite sports:', favError);
        return [];
      }
      
      return (data || []).map(item => item.sport_id).filter(Boolean) as string[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,  // 5 minutes cache
    gcTime: 10 * 60 * 1000,   // 10 minutes before garbage collection
  });

  // 3. Créer un Set pour lookup rapide O(1)
  const favoriteSet = useMemo(() => new Set(favoriteSportIds), [favoriteSportIds]);

  // 4. Fusionner sports + matchCounts + tri par favoris
  const sports = useMemo<SportWithCounts[]>(() => {
    const mapped = rawSports.map((sport, originalIndex) => {
      const sportMapping = SPORTS_MAPPING.find(
        s => s.slug === sport.slug || s.id === sport.azuro_id?.toString()
      );
      
      // Lookup par UUID (sport.id)
      const counts = matchCounts?.[sport.id] || { total: 0, live: 0, prematch: 0 };
      const isFavorite = favoriteSet.has(sport.id);
      
      return {
        id: sport.slug,
        slug: sport.slug,
        name: sport.name,
        icon: sportMapping?.icon || SPORTS_MAPPING[0].icon,
        count: counts.total,
        liveCount: counts.live,
        prematchCount: counts.prematch,
        isFavorite,
        _originalIndex: originalIndex, // Pour garder l'ordre original
      };
    });
    
    // Trier : favoris en premier, puis ordre original (display_order)
    return mapped.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a._originalIndex - b._originalIndex;
    }).map(({ _originalIndex, ...sport }) => sport); // Retirer _originalIndex
  }, [rawSports, matchCounts, favoriteSet]);

  const totalLive = useMemo(() => 
    sports.reduce((sum, sport) => sum + sport.liveCount, 0),
    [sports]
  );

  return {
    sports,
    totalLive,
    loading: isLoading,
    error,
  };
}
