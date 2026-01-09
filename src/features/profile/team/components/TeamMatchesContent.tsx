import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseGames } from '@/features/sports/hooks/useSupabaseGames';
import { useMatchReactions } from '@/features/sports/hooks/useMatchReactions';
import { useMatchNavigation } from '@/hooks/useMatchNavigation';
import { UnifiedMatchCard } from '@/components/matches';
import { MatchListSkeleton } from '@/components/ui/page-skeletons';
import type { Comment } from '@/features/social-feed/components/shared/CommentSection';

interface TeamMatchesContentProps {
  teamId: string;
  leagueId?: string;
}

export function TeamMatchesContent({ teamId, leagueId }: TeamMatchesContentProps) {
  const { t } = useTranslation('pages');
  const { navigateToMatch } = useMatchNavigation();
  const { reactions, toggleLike, addComment, loadReactions, loadComments } = useMatchReactions();
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  
  // Fetch upcoming matches
  const { data: upcomingGames = [], isLoading: loadingUpcoming } = useSupabaseGames({
    teamId,
    leagueId,
    limit: 10,
    orderBy: 'start_iso',
    orderDirection: 'asc',
    timeFilter: 'upcoming',
  });

  // Fetch past matches
  const { data: pastGames = [], isLoading: loadingPast } = useSupabaseGames({
    teamId,
    leagueId,
    limit: 10,
    orderBy: 'start_iso',
    orderDirection: 'desc',
    timeFilter: 'past',
  });

  // Load reactions when matches load
  useEffect(() => {
    const allMatchIds = [...upcomingGames, ...pastGames].map(g => g.id);
    if (allMatchIds.length > 0) {
      loadReactions(allMatchIds);
    }
  }, [upcomingGames, pastGames, loadReactions]);

  const handleToggleComments = useCallback(async (matchId: string) => {
    const isExpanded = expandedComments[matchId];
    
    if (!isExpanded && !comments[matchId]) {
      setLoadingComments(prev => ({ ...prev, [matchId]: true }));
      const matchComments = await loadComments(matchId);
      setComments(prev => ({ ...prev, [matchId]: matchComments }));
      setLoadingComments(prev => ({ ...prev, [matchId]: false }));
    }
    
    setExpandedComments(prev => ({ ...prev, [matchId]: !isExpanded }));
  }, [expandedComments, comments, loadComments]);

  const handleAddComment = useCallback(async (matchId: string, text: string) => {
    await addComment(matchId, text);
    const matchComments = await loadComments(matchId);
    setComments(prev => ({ ...prev, [matchId]: matchComments }));
  }, [addComment, loadComments]);

  const isLoading = loadingUpcoming || loadingPast;

  if (isLoading) {
    return <MatchListSkeleton count={4} />;
  }

  const hasNoMatches = upcomingGames.length === 0 && pastGames.length === 0;

  if (hasNoMatches) {
    return (
      <p className="text-muted-foreground text-center py-8">{t('team.matches.noMatches')}</p>
    );
  }

  return (
    <div>
      {/* Upcoming matches */}
      {upcomingGames.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2 bg-muted/30">
            {t('team.matches.upcoming')}
          </h3>
          <div className="divide-y divide-border">
            {upcomingGames.map((game) => (
              <UnifiedMatchCard
                key={game.id}
                match={game}
                variant="feed"
                teamId={teamId}
                reactions={reactions[game.id]}
                comments={comments[game.id] || []}
                showComments={expandedComments[game.id] || false}
                isLoadingComments={loadingComments[game.id] || false}
                onLike={() => toggleLike(game.id)}
                onToggleComments={() => handleToggleComments(game.id)}
                onAddComment={(text) => handleAddComment(game.id, text)}
                onClick={() => navigateToMatch({
                  id: game.id,
                  home_name: game.participants?.[0]?.name,
                  away_name: game.participants?.[1]?.name,
                  league_slug: game.league?.slug,
                  league_name: game.league?.name,
                  sport_slug: game.sport?.slug,
                  sport_name: game.sport?.name,
                })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past matches */}
      {pastGames.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2 bg-muted/30">
            {t('team.matches.past')}
          </h3>
          <div className="divide-y divide-border">
            {pastGames.map((game) => (
              <UnifiedMatchCard
                key={game.id}
                match={game}
                variant="feed"
                teamId={teamId}
                reactions={reactions[game.id]}
                comments={comments[game.id] || []}
                showComments={expandedComments[game.id] || false}
                isLoadingComments={loadingComments[game.id] || false}
                onLike={() => toggleLike(game.id)}
                onToggleComments={() => handleToggleComments(game.id)}
                onAddComment={(text) => handleAddComment(game.id, text)}
                onClick={() => navigateToMatch({
                  id: game.id,
                  home_name: game.participants?.[0]?.name,
                  away_name: game.participants?.[1]?.name,
                  league_slug: game.league?.slug,
                  league_name: game.league?.name,
                  sport_slug: game.sport?.slug,
                  sport_name: game.sport?.name,
                })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
