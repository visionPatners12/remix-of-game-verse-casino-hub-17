import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSupabaseGames } from '@/features/sports/hooks/useSupabaseGames';
import { useMatchReactions } from '@/features/sports/hooks/useMatchReactions';
import { UnifiedMatchCard } from '@/components/matches';
import { LiveFeedCard } from '@/features/sports/components/MatchCard/components/LiveFeedCard';
import { MatchListSkeleton } from '@/components/ui/page-skeletons';
import type { Comment } from '@/features/social-feed/components/shared/CommentSection';

interface LeagueMatchesContentProps {
  leagueId: string;
  onCountUpdate?: (upcoming: number, past: number) => void;
}

export function LeagueMatchesContent({ leagueId, onCountUpdate }: LeagueMatchesContentProps) {
  const { t } = useTranslation('pages');
  const navigate = useNavigate();
  const { reactions, toggleLike, addComment, loadReactions, loadComments } = useMatchReactions();
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  
  // Fetch LIVE matches first
  const { data: liveGames = [], isLoading: loadingLive } = useSupabaseGames({
    leagueId,
    limit: 50,
    orderBy: 'start_iso',
    orderDirection: 'asc',
    isLive: true,
  });

  // Fetch ALL upcoming matches (no limit)
  const { data: upcomingGames = [], isLoading: loadingUpcoming } = useSupabaseGames({
    leagueId,
    limit: 100,
    orderBy: 'start_iso',
    orderDirection: 'asc',
    timeFilter: 'upcoming',
  });

  // Fetch ALL past matches (no limit)
  const { data: pastGames = [], isLoading: loadingPast } = useSupabaseGames({
    leagueId,
    limit: 100,
    orderBy: 'start_iso',
    orderDirection: 'desc',
    timeFilter: 'past',
  });

  // Filter out matches with past dates from live and upcoming
  const now = Date.now();
  
  const filteredLiveGames = useMemo(() => {
    return liveGames.filter(game => {
      const startsAt = parseInt(String(game.startsAt)) * 1000;
      return startsAt > now - (3 * 60 * 60 * 1000); // Tolérance 3h pour matchs en cours
    });
  }, [liveGames, now]);

  const filteredUpcomingGames = useMemo(() => {
    return upcomingGames.filter(game => {
      const startsAt = parseInt(String(game.startsAt)) * 1000;
      return startsAt > now;
    });
  }, [upcomingGames, now]);

  // Update parent with counts
  useEffect(() => {
    if (onCountUpdate && !loadingUpcoming && !loadingPast) {
      onCountUpdate(filteredUpcomingGames.length, pastGames.length);
    }
  }, [filteredUpcomingGames.length, pastGames.length, loadingUpcoming, loadingPast, onCountUpdate]);

  // Load reactions when matches load
  useEffect(() => {
    const allMatchIds = [...filteredLiveGames, ...filteredUpcomingGames, ...pastGames].map(g => g.id);
    if (allMatchIds.length > 0) {
      loadReactions(allMatchIds);
    }
  }, [filteredLiveGames, filteredUpcomingGames, pastGames, loadReactions]);

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

  const isLoading = loadingLive || loadingUpcoming || loadingPast;

  if (isLoading) {
    return <MatchListSkeleton count={4} />;
  }

  const hasNoMatches = filteredLiveGames.length === 0 && filteredUpcomingGames.length === 0 && pastGames.length === 0;

  if (hasNoMatches) {
    return (
      <p className="text-muted-foreground text-center py-8">{t('league.matches.noMatches')}</p>
    );
  }

  return (
    <div>
      {/* Live matches */}
      {filteredLiveGames.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive px-4 py-2 bg-destructive/10 flex items-center gap-2">
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            {t('league.matches.live')} ({filteredLiveGames.length})
          </h3>
          <div>
            {filteredLiveGames.map((game) => (
              <LiveFeedCard
                key={game.id}
                match={{
                  id: game.id,
                  gameId: game.gameId,
                  startsAt: String(game.startsAt),
                  status: 'Live',
                  league: game.league,
                  sport: game.sport,
                  participants: game.participants,
                }}
                onClick={() => navigate(`/match/unknown/unknown/unknown/${game.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming matches */}
      {filteredUpcomingGames.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2 bg-muted/30">
            {t('league.matches.upcoming')} ({filteredUpcomingGames.length})
          </h3>
          <div className="divide-y divide-border/20">
            {filteredUpcomingGames.map((game) => (
              <UnifiedMatchCard
                key={game.id}
                match={game}
                variant="feed"
                reactions={reactions[game.id]}
                comments={comments[game.id] || []}
                showComments={expandedComments[game.id] || false}
                isLoadingComments={loadingComments[game.id] || false}
                onLike={() => toggleLike(game.id)}
                onToggleComments={() => handleToggleComments(game.id)}
                onAddComment={(text) => handleAddComment(game.id, text)}
                onClick={() => navigate(`/match/unknown/unknown/unknown/${game.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past matches */}
      {pastGames.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2 bg-muted/30">
            {t('league.matches.past')} ({pastGames.length})
          </h3>
          <div className="divide-y divide-border/20">
            {pastGames.map((game) => (
              <UnifiedMatchCard
                key={game.id}
                match={game}
                variant="feed"
                reactions={reactions[game.id]}
                comments={comments[game.id] || []}
                showComments={expandedComments[game.id] || false}
                isLoadingComments={loadingComments[game.id] || false}
                onLike={() => toggleLike(game.id)}
                onToggleComments={() => handleToggleComments(game.id)}
                onAddComment={(text) => handleAddComment(game.id, text)}
                onClick={() => navigate(`/match/unknown/unknown/unknown/${game.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
