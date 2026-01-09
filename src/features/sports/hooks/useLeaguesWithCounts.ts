
import { useMemo } from "react";
import { useNavigation } from "@azuro-org/sdk";
import { type NavigationQuery } from "@azuro-org/toolkit";

export interface LeagueWithCounts {
  id: string;
  slug: string;
  name: string;
  image_path?: string;
  activeGamesCount: number;
  country_name?: string;
  country_slug?: string;
}

interface UseLeaguesWithCountsProps {
  sportSlug: string;
  isLive?: boolean;
}

export function useLeaguesWithCounts({ sportSlug, isLive }: UseLeaguesWithCountsProps) {
  

  const { data = [], isFetching, error }: { 
    data: NavigationQuery['sports'], 
    isFetching: boolean, 
    error: unknown 
  } = useNavigation({
    chainId: 137,
    isLive,
    query: { 
      staleTime: isLive ? 15_000 : 45_000,
      refetchOnWindowFocus: false
    },
  });


  const leagues = useMemo(() => {
    if (!data?.length) return [];
    
    // Trouve le sport par son slug au lieu de l'ID
    const targetSport = data.find(sport => sport.slug === sportSlug);
    
    if (!targetSport?.countries?.length) {
      return [];
    }

    // Optimize with single flatMap operation
    return targetSport.countries.flatMap((country) => 
      country.leagues.map((lg) => ({
        id: lg.slug,
        slug: lg.slug,
        name: lg.name,
        image_path: undefined, // Pas d'image générique pour permettre l'affichage du drapeau
        activeGamesCount: Number(lg.activeGamesCount),
        country_name: country.name, // Utiliser le nom du pays d'Azuro
        country_slug: country.slug, // Utiliser le slug du pays d'Azuro
      }))
    );
  }, [data, sportSlug]);

  const totalMatches = useMemo(
    () => leagues.reduce((sum, l) => sum + l.activeGamesCount, 0),
    [leagues],
  );


  return {
    leagues,
    totalMatches,
    loading: isFetching,
    error,
  };
}
