import React from 'react';
import { Flame, Globe } from 'lucide-react';
import { UnifiedMatchCard } from '@/components/matches';
import { LogoLoading } from '@/components/ui/logo-loading';
import { getMatchSearchTerms, matchesSearchTerms } from '@/utils/searchHelpers';
import { useSupabaseSportsNav } from '../hooks/useSupabaseSportsNav';
import { useSupabaseGames } from '../hooks/useSupabaseGames';
import { useMatchComments } from '../hooks/useMatchComments';
import { getMatchStateBadge } from '../utils/matchBadgeUtils';

interface SportsHomeProps {
  onMatchClick: (match: import('../types').MatchData) => void;
  searchQuery?: string;
  selectedSport?: string | null;
  onSportChange?: (sportSlug: string | null) => void;
}

export const SportsHome: React.FC<SportsHomeProps> = ({ onMatchClick, searchQuery, selectedSport, onSportChange }) => {
  // Sports data
  const { sports, loading: sportsLoading } = useSupabaseSportsNav({ isLive: false });

  // Top events from Supabase
  const { data: allTopEvents = [], isFetching: isLoadingTopEvents } = useSupabaseGames({
    sportSlug: selectedSport || undefined,
    limit: 8,
    orderBy: 'turnover',
    staleTime: 20_000,
  });

  // Search filtering
  const topEvents = React.useMemo(() => {
    if (!searchQuery) return allTopEvents;
    
    return allTopEvents.filter(match => {
      const matchSearchTerms = getMatchSearchTerms(match);
      return matchesSearchTerms(matchSearchTerms, searchQuery);
    });
  }, [allTopEvents, searchQuery]);

  const matchIds = React.useMemo(() => topEvents.map(m => m.id).filter(Boolean), [topEvents]);

  const {
    expandedComments,
    matchComments,
    loadingComments,
    reactions,
    handleToggleComments,
    handleAddComment,
    handleLike,
  } = useMatchComments({ matchIds });

  

  // Dynamic title based on selected sport
  const topEventsTitle = React.useMemo(() => {
    if (!selectedSport) return "Top Events";
    const sport = sports.find(s => s.slug === selectedSport);
    return sport ? `Top ${sport.name} Events` : "Top Events";
  }, [selectedSport, sports]);

  return (
    <div className="space-y-3 pt-1">
      {/* Top Events Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-4">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-bold text-foreground">{topEventsTitle}</h2>
        </div>

        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-border animate-fade-in">
          <div className="px-4 py-2">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {/* All button */}
              <button
                onClick={() => onSportChange?.(null)}
                className="flex-shrink-0 flex flex-col items-center gap-1 group"
                aria-label="All sports"
              >
                <div className={`w-10 h-10 rounded-full border inline-flex items-center justify-center transition-colors hover-scale ${
                  !selectedSport
                    ? 'bg-primary text-primary-foreground border-primary shadow'
                    : 'bg-card text-card-foreground border-border group-hover:bg-primary/5'
                }`}>
                  <Globe className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-medium truncate max-w-[48px] ${
                  !selectedSport ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  All
                </span>
              </button>

              {/* Sports icons */}
              {sports.map((sport) => (
                <button
                  key={sport.slug}
                  onClick={() => onSportChange?.(sport.slug)}
                  className="flex-shrink-0 flex flex-col items-center gap-1 group"
                  aria-label={sport.name}
                >
                  <div className={`w-10 h-10 rounded-full border inline-flex items-center justify-center transition-colors hover-scale ${
                    selectedSport === sport.slug
                      ? 'bg-primary text-primary-foreground border-primary shadow'
                      : 'bg-card text-card-foreground border-border group-hover:bg-primary/5'
                  }`}>
                    <sport.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-medium truncate max-w-[48px] ${
                    selectedSport === sport.slug ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {sport.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {isLoadingTopEvents ? (
            <div className="flex justify-center py-8">
              <LogoLoading text="Loading..." size="md" />
            </div>
          ) : topEvents.length > 0 ? (
            topEvents.map((match) => (
              <div key={match.gameId} className="relative">
                {getMatchStateBadge(match.state) && (
                  <div className="absolute top-4 right-4 z-20">
                    {getMatchStateBadge(match.state)}
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
                  onAddComment={(text, gif) => handleAddComment(match.id, text, gif)}
                  onToggleComments={() => handleToggleComments(match.id)}
                  onLike={() => handleLike(match.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No matches found for this sport
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
