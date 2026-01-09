import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { CountryFlag } from '@/components/ui/country-flag';
import { Badge } from '@/components/ui/badge';
import type { LeagueWithCounts } from '@/features/sports/hooks/useSupabaseLeaguesNav';

interface MobileLeaguesListProps {
  leagues: LeagueWithCounts[];
  onLeagueSelect: (league: { slug: string; country: string }) => void;
  isLoading?: boolean;
}

export function MobileLeaguesList({ leagues, onLeagueSelect, isLoading }: MobileLeaguesListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (leagues.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-muted-foreground">No leagues available</div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/10">
      {leagues.map((league) => (
        <button
          key={league.id}
          onClick={() => onLeagueSelect({ slug: league.slug, country: league.country_name || '' })}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
        >
          <CountryFlag 
            countryName={league.country_name || league.name}
            countrySlug={league.country_slug || league.slug}
            size={24}
          />
          
          <div className="flex-1 min-w-0">
            {league.country_name && league.country_name !== league.name && (
              <div className="text-xs text-muted-foreground truncate">
                {league.country_name}
              </div>
            )}
            <div className="text-sm font-medium truncate">
              {league.name}
            </div>
          </div>
          
          <Badge variant="secondary" className="text-xs shrink-0">
            {league.activeGamesCount}
          </Badge>
          
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      ))}
    </div>
  );
}
