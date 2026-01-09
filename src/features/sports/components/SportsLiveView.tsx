import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Radio } from 'lucide-react';
import { useLiveGames } from '@/features/sports/hooks/useLiveGames';
import { useSupabaseSportsNav } from '@/features/sports/hooks/useSupabaseSportsNav';
import { useSupabaseLeaguesNav } from '@/features/sports/hooks/useSupabaseLeaguesNav';
import { useMatchComments } from '@/features/sports/hooks/useMatchComments';
import { LiveFeedCard } from '@/features/sports/components/MatchCard/components/LiveFeedCard';
import { LeagueSidebar } from '@/features/sports/components/LeagueSidebar';
import { MobileLeaguesList } from '@/features/sports/components/MobileLeaguesList';
import { CountryFlag } from '@/components/ui/country-flag';
import { LogoLoading } from '@/components/ui/logo-loading';
import { getSportById } from '@/lib/sportsMapping';
import { getMatchSearchTerms, matchesSearchTerms } from '@/utils/searchHelpers';
import { useIsMobile } from '@/hooks/use-mobile';

interface SportsLiveViewProps {
  onMatchClick: (match: import('../types').MatchData) => void;
  searchQuery?: string;
}

export const SportsLiveView: React.FC<SportsLiveViewProps> = ({ 
  onMatchClick,
  searchQuery 
}) => {
  const isMobile = useIsMobile();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<{ slug: string; country: string } | null>(null);

  // Reset league when sport changes
  useEffect(() => {
    setSelectedLeague(null);
  }, [selectedSport]);

  // Sports with live counts
  const { sports: sportsWithCounts, loading: sportsLoading } = useSupabaseSportsNav({ isLive: true });
  
  // Live matches
  const { 
    data: allLiveMatches = [], 
    isFetching: gamesLoading 
  } = useLiveGames({
    limit: 100,
    sportSlug: selectedSport || undefined
  });

  // Leagues for selected sport (live only)
  const { 
    leagues, 
    totalMatches: leagueTotalMatches,
    loading: leaguesLoading 
  } = useSupabaseLeaguesNav({ 
    sportSlug: selectedSport || 'football', 
    isLive: true 
  });

  // Search filtering
  const liveMatches = React.useMemo(() => {
    let matches = allLiveMatches;
    
    // Filter by search query
    if (searchQuery) {
      matches = matches.filter(match => {
        const matchSearchTerms = getMatchSearchTerms(match);
        return matchesSearchTerms(matchSearchTerms, searchQuery);
      });
    }
    
    // Filter by selected league
    if (selectedLeague) {
      matches = matches.filter(match => {
        const matchLeagueSlug = match.league?.slug;
        const matchCountry = match.country?.name;
        return matchLeagueSlug === selectedLeague.slug && matchCountry === selectedLeague.country;
      });
    }
    
    return matches;
  }, [allLiveMatches, searchQuery, selectedLeague]);

  const matchIds = React.useMemo(() => liveMatches.map(m => m.id).filter(Boolean), [liveMatches]);

  const {
    expandedComments,
    matchComments,
    loadingComments,
    reactions,
    handleToggleComments,
    handleAddComment,
    handleLike,
  } = useMatchComments({ matchIds });

  const handleLeagueSelect = (leagueId: string | null) => {
    if (!leagueId) {
      setSelectedLeague(null);
    } else {
      const [slug, country] = leagueId.split('|');
      setSelectedLeague({ slug, country });
    }
  };

  if (sportsLoading) {
    return (
      <div className="flex justify-center py-8">
        <LogoLoading text="Loading live events..." size="md" />
      </div>
    );
  }

  // Match list component (reusable for both layouts)
  const MatchList = () => (
    <div className="relative">
      {gamesLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <LogoLoading text="Loading matches..." size="sm" />
        </div>
      )}
      
      {liveMatches.length === 0 && !gamesLoading ? (
        <div className="text-center py-12 px-4">
          <div className="text-muted-foreground">
            {selectedLeague 
              ? `No live matches in this league`
              : selectedSport 
                ? `No live ${getSportById(selectedSport).name} matches` 
                : 'No live matches'}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Live matches will appear here
          </div>
        </div>
      ) : (
        <motion.div 
          key={`${selectedSport || 'all'}-${selectedLeague?.slug || 'all'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {liveMatches.map((match) => (
            <LiveFeedCard
              key={match.id}
              match={match}
              onClick={() => onMatchClick(match)}
              reactions={reactions[match.id]}
              comments={matchComments.get(match.id) || []}
              showComments={expandedComments.has(match.id)}
              isLoadingComments={loadingComments.has(match.id)}
              onAddComment={(text) => handleAddComment(match.id, text)}
              onToggleComments={() => handleToggleComments(match.id)}
              onLike={() => handleLike(match.id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/10">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-destructive animate-pulse" />
          <h2 className="text-lg font-semibold">Live Events</h2>
        </div>
        <Badge variant="destructive" className="animate-pulse text-xs">
          {allLiveMatches.length}
        </Badge>
      </div>

      {/* Sport tabs */}
      <div className="px-4 py-3 border-b border-border/10">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedSport(null)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
              selectedSport === null 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <span>All</span>
            {allLiveMatches.length > 0 && (
              <span className="bg-background/20 text-xs px-1.5 py-0.5 rounded-full">
                {allLiveMatches.length}
              </span>
            )}
          </button>
          
          {sportsWithCounts.map((sport) => {
            const sportData = getSportById(sport.slug);
            const matchCount = selectedSport === sport.slug ? allLiveMatches.length : sport.liveCount;
            return (
              <button
                key={sport.slug}
                onClick={() => setSelectedSport(sport.slug)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                  selectedSport === sport.slug 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <sportData.icon className="w-3.5 h-3.5" />
                <span>{sportData.name}</span>
                {matchCount > 0 && (
                  <span className="bg-background/20 text-xs px-1.5 py-0.5 rounded-full">
                    {matchCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content - different layout based on sport selection and device */}
      {selectedSport ? (
        isMobile ? (
          // Mobile: Two-step navigation - show leagues first, then matches when league selected
          selectedLeague ? (
            // League selected - show matches with back button
            <>
              <div className="px-4 py-3 border-b border-border/10">
                <button
                  onClick={() => setSelectedLeague(null)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>←</span>
                  <span>Back to leagues</span>
                </button>
                <div className="mt-2 flex items-center gap-2">
                  <CountryFlag 
                    countryName={selectedLeague.country}
                    countrySlug={selectedLeague.country.toLowerCase().replace(/\s+/g, '-')}
                    size={20}
                  />
                  <span className="font-medium text-sm">
                    {leagues.find(l => l.slug === selectedLeague.slug && l.country_name === selectedLeague.country)?.name || selectedLeague.slug}
                  </span>
                </div>
              </div>
              <MatchList />
            </>
          ) : (
            // No league selected - show leagues list
            <MobileLeaguesList
              leagues={leagues}
              onLeagueSelect={setSelectedLeague}
              isLoading={leaguesLoading}
            />
          )
        ) : (
          // Desktop: Sidebar + match list
          <div className="flex">
            <div className="w-64 flex-shrink-0 border-r border-border/10">
              <LeagueSidebar
                leagues={leagues}
                selectedLeagueId={selectedLeague ? `${selectedLeague.slug}|${selectedLeague.country}` : null}
                onLeagueSelect={handleLeagueSelect}
                totalMatches={leagueTotalMatches}
              />
            </div>
            <div className="flex-1">
              <MatchList />
            </div>
          </div>
        )
      ) : (
        // No sport selected - just show all matches
        <MatchList />
      )}
    </div>
  );
};
