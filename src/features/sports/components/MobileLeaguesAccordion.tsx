import React, { useState, useCallback, useMemo } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/ui/country-flag";
import { UnifiedMatchCard } from '@/components/matches';
import { useSupabaseGames } from "@/features/sports/hooks/useSupabaseGames";
import { useMatchComments } from "@/features/sports/hooks/useMatchComments";
import { shortenCountryName } from "@/features/sports/utils/countryNameUtils";
import type { LeagueWithCounts } from "@/features/sports/hooks/useLeaguesWithCounts";
import type { MatchData } from "@/features/sports/types";

interface MobileLeaguesAccordionProps {
  leagues: LeagueWithCounts[];
  sportSlug: string;
  onMatchClick: (match: MatchData) => void;
}

// Sub-component that fetches matches only when league is expanded
interface LeagueMatchesProps {
  leagueSlug: string;
  countryName: string;
  sportSlug: string;
  onMatchClick: (match: MatchData) => void;
}

function LeagueMatches({ leagueSlug, countryName, sportSlug, onMatchClick }: LeagueMatchesProps) {
  // Fetch matches only when this component is rendered (lazy loading)
  const { data: games = [], isFetching } = useSupabaseGames({
    leagueSlug,
    countryName,
    sportSlug,
    limit: 50,
    orderBy: 'start_iso',
    staleTime: 15_000,
  });

  // Transform games to MatchData format
  const matches: MatchData[] = useMemo(() => games.map(game => ({
    id: game.id,
    gameId: game.gameId,
    slug: game.slug,
    title: game.title,
    startsAt: String(game.startsAt),
    state: game.state,
    turnover: game.turnover,
    league: game.league ? {
      id: game.league.slug,
      slug: game.league.slug,
      name: game.league.name,
      logo: game.league.logo,
      country_name: game.country?.name,
      country_slug: game.country?.slug,
    } : undefined,
    sport: game.sport ? {
      sportId: game.sport.sportId,
      slug: game.sport.slug,
      name: game.sport.name,
      icon_name: game.sport.icon_name,
    } : undefined,
    country: game.country ? {
      name: game.country.name,
      slug: game.country.slug,
    } : undefined,
    participants: game.participants?.map(p => ({
      name: p.name,
      image: p.image,
    })),
    status: game.state,
    stage: game.stage,
    round: game.round,
  })), [games]);

  // Get match IDs for reactions hook
  const matchIds = useMemo(() => matches.map(m => m.id).filter(Boolean), [matches]);

  // Use the shared comments/reactions hook
  const {
    expandedComments,
    matchComments,
    loadingComments,
    reactions,
    handleToggleComments,
    handleAddComment,
    handleLike,
  } = useMatchComments({ matchIds });

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6 bg-muted/10 rounded-lg">
        No matches available
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {matches.map((match) => (
        <UnifiedMatchCard
          key={match.id}
          match={match}
          variant="feed"
          onClick={() => onMatchClick(match)}
          reactions={reactions[match.id]}
          comments={matchComments.get(match.id) || []}
          showComments={expandedComments.has(match.id)}
          isLoadingComments={loadingComments.has(match.id)}
          onAddComment={(text, gif) => handleAddComment(match.id, text, gif)}
          onToggleComments={() => handleToggleComments(match.id)}
          onLike={() => handleLike(match.id)}
        />
      ))}
    </div>
  );
}

export function MobileLeaguesAccordion({ 
  leagues, 
  sportSlug,
  onMatchClick 
}: MobileLeaguesAccordionProps) {
  const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set());

  const toggleLeague = (leagueId: string) => {
    const newExpanded = new Set(expandedLeagues);
    if (newExpanded.has(leagueId)) {
      newExpanded.delete(leagueId);
    } else {
      newExpanded.add(leagueId);
    }
    setExpandedLeagues(newExpanded);
  };

  // Memoize match click handler
  const handleMatchClick = useCallback((match: MatchData) => {
    onMatchClick(match);
  }, [onMatchClick]);

  return (
    <div className="w-full overflow-hidden">
      {leagues.map((league) => {
        const isExpanded = expandedLeagues.has(league.id);
        const shortCountryName = shortenCountryName(league.country_name || '');
        
        return (
          <div key={league.id} className="border-b border-border/30 last:border-b-0">
            <div
              className="flex items-center justify-between py-2 px-4 cursor-pointer hover:bg-muted/20 transition-colors active:bg-muted/30"
              onClick={() => toggleLeague(league.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <div className="w-5 h-5 flex-shrink-0">
                  <CountryFlag 
                    countryName={league.country_name || league.name}
                    countrySlug={league.country_slug || league.slug}
                    size={20}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {league.country_name && league.country_name !== league.name ? (
                      <span className="text-foreground">
                        {shortCountryName} • {league.name}
                      </span>
                    ) : (
                      <span className="text-foreground">
                        {league.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <Badge 
                  variant="secondary" 
                  className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex-shrink-0 min-w-[2rem] text-center"
                >
                  {league.activeGamesCount}
                </Badge>
              </div>
              
              <ChevronDown 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
            
            {isExpanded && (
              <div className="pb-4">
                <LeagueMatches
                  leagueSlug={league.slug}
                  countryName={league.country_name || 'unknown'}
                  sportSlug={sportSlug}
                  onMatchClick={handleMatchClick}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
