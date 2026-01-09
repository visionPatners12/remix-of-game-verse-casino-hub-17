import React from 'react';
import { LeagueSidebar } from './LeagueSidebar';
import { MobileLeaguesAccordion } from './MobileLeaguesAccordion';
import { UnifiedMatchCard } from '@/components/matches';
import { useMatchComments } from '@/features/sports/hooks/useMatchComments';
import { getMatchStateBadge } from '@/features/sports/utils/matchBadgeUtils';
import type { LeagueWithCounts } from '@/features/sports/hooks/useLeaguesWithCounts';
import type { MatchData } from '@/features/sports/types';

interface SportsContentProps {
  leagues: LeagueWithCounts[];
  selectedLeagueId: string | null;
  onLeagueSelect: (leagueSlug: string | null) => void;
  totalMatches: number;
  filteredMatches: MatchData[];
  onMatchClick: (match: MatchData) => void;
  viewMode: 'grid' | 'list' | 'horizontal';
  isMobile: boolean;
  sportSlug: string;
}

export function SportsContent({
  leagues,
  selectedLeagueId,
  onLeagueSelect,
  totalMatches,
  filteredMatches,
  onMatchClick,
  viewMode,
  isMobile,
  sportSlug
}: SportsContentProps) {
  const matchIds = React.useMemo(() => filteredMatches.map(m => m.id).filter(Boolean), [filteredMatches]);
  
  const {
    expandedComments,
    matchComments,
    loadingComments,
    reactions,
    handleToggleComments,
    handleAddComment,
    handleLike,
  } = useMatchComments({ matchIds });

  if (isMobile) {
    return (
      <div className="w-full">
        <MobileLeaguesAccordion
          leagues={leagues}
          sportSlug={sportSlug}
          onMatchClick={onMatchClick}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-3">
      <div className="flex gap-4">
        <LeagueSidebar
          leagues={leagues}
          selectedLeagueId={selectedLeagueId}
          onLeagueSelect={onLeagueSelect}
          totalMatches={totalMatches}
        />
        
        <div className="flex-1">
          <div className="max-w-2xl mx-auto">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <div key={match.id} className="relative">
                  {getMatchStateBadge(match.status) && (
                    <div className="absolute top-4 right-4 z-20">
                      {getMatchStateBadge(match.status)}
                    </div>
                  )}
                  
                  <UnifiedMatchCard
                    match={match}
                    variant="feed"
                    onClick={() => onMatchClick(match)}
                    reactions={reactions[match.id]}
                    comments={matchComments.get(match.id) || []}
                    showComments={expandedComments.has(match.id)}
                    isLoadingComments={loadingComments.has(match.id)}
                    onAddComment={(text) => handleAddComment(match.id, text)}
                    onToggleComments={() => handleToggleComments(match.id)}
                    onLike={() => handleLike(match.id)}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No matches found for this league
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
