import React, { useState } from 'react';
import { Layout } from "@/components/Layout";
import { useMatchNavigation } from '@/hooks/useMatchNavigation';
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  SportsHeader, 
  SportsContent, 
  SportsHome,
  SportsLiveView, 
  useSupabaseGames,
  useMatchCountsBySport
} from "@/features/sports";
import { useSupabaseSportsNav } from "@/features/sports/hooks/useSupabaseSportsNav";
import { useSupabaseLeaguesNav } from "@/features/sports/hooks/useSupabaseLeaguesNav";
import { useDebounce } from "@/hooks/useDebounce";
import { getMatchSearchTerms, matchesSearchTerms } from "@/utils/searchHelpers";
import { SportsSEOHead } from "@/components/seo/SportsSEOHead";
import { WebInstallBanner } from "@/components/web";

/**
 * Simplified Sports page using the native Azuro SDK directly
 */
export default function OptimizedSports() {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<'home' | 'matches' | 'live'>('home');
  
  // Local state instead of Zustand
  const [selectedSport, setSelectedSport] = useState('football');
  const [selectedLeague, setSelectedLeague] = useState<{ slug: string; country: string } | null>(null);
  const [showLive, setShowLive] = useState(false);
  const [viewMode] = useState<'grid' | 'list' | 'horizontal'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Fetch match counts for all sports
  const { data: matchCounts = {} } = useMatchCountsBySport();
  
  // Use Supabase-based navigation hooks
  const { leagues, totalMatches, loading: isLoading, error } = useSupabaseLeaguesNav({ 
    sportSlug: selectedSport,
    isLive: showLive 
  });
  
  // Use Supabase games hook instead of Azuro SDK
  const { data: games = [], isFetching } = useSupabaseGames({
    sportSlug: selectedSport || undefined,
    leagueSlug: selectedLeague?.slug || undefined,
    countryName: selectedLeague?.country || undefined,
    orderBy: 'start_iso',
    staleTime: 15_000, // Réduit de 30s à 15s pour des cotes plus fraîches
  });

  // Apply search filtering - pass raw data to preserve all fields (stage, round, sport icon, league logo)
  const filteredMatches = React.useMemo(() => {
    if (!debouncedQuery) return games;
    
    return games.filter(match => {
      const matchSearchTerms = getMatchSearchTerms(match);
      return matchesSearchTerms(matchSearchTerms, debouncedQuery);
    });
  }, [games, debouncedQuery]);

  const { navigateToMatch } = useMatchNavigation();

  // Navigation handler - uses SEO-friendly URL with full match data
  const handleMatchClick = (match: import('@/features/sports/types').MatchData) => {
    console.log('🔗 Navigating to match details:', match.id);
    navigateToMatch({
      id: match.id,
      home_name: match.participants?.[0]?.name,
      away_name: match.participants?.[1]?.name,
      league_slug: match.league?.slug,
      league_name: match.league?.name,
      sport_slug: match.sport?.slug,
      sport_name: match.sport?.name,
    });
  };

  // Filter sport without changing section (for Top Events)
  const handleSportFilter = (sportSlug: string | null) => {
    if (sportSlug) {
      setSelectedSport(sportSlug);
      setSelectedLeague(null); // Reset league selection
    }
  };

  // Navigate to matches section with sport selection (for header navigation)
  const handleSportSelectWithNavigation = (sportSlug: string | null) => {
    if (sportSlug) {
      setSelectedSport(sportSlug);
      setSelectedLeague(null); // Reset league selection
      setActiveSection('matches'); // Show matches for selected sport
    }
  };

  const handleLiveToggle = () => {
    
    setShowLive(!showLive);
  };

  return (
    <Layout>
      <SportsSEOHead 
        pageType="sports" 
        data={{ selectedSport: selectedSport }} 
      />
      <div className="min-h-screen bg-background pt-16">
        <SportsHeader
          selectedSport={selectedSport}
          onSportSelect={handleSportSelectWithNavigation}
          showLive={showLive}
          onLiveToggle={handleLiveToggle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          matchCounts={matchCounts}
        />

        {activeSection === 'home' ? (
          <SportsHome 
            onMatchClick={handleMatchClick}
            selectedSport={selectedSport}
            onSportChange={handleSportFilter}
            searchQuery={searchQuery}
          />
        ) : activeSection === 'live' ? (
          <SportsLiveView onMatchClick={handleMatchClick} />
        ) : (
          <SportsContent
            leagues={leagues}
            selectedLeagueId={selectedLeague?.slug && selectedLeague?.country ? `${selectedLeague.slug}|${selectedLeague.country}` : null}
            onLeagueSelect={(leagueId) => {
              if (!leagueId) {
                setSelectedLeague(null);
              } else {
                // Parse composite key: slug|country
                const [slug, country] = leagueId.split('|');
                setSelectedLeague({ slug, country });
              }
            }}
            totalMatches={totalMatches}
            filteredMatches={filteredMatches}
            onMatchClick={handleMatchClick}
            viewMode={viewMode}
            isMobile={isMobile}
            sportSlug={selectedSport}
          />
        )}
        
        {/* Install banner for web visitors */}
        <WebInstallBanner />
      </div>
    </Layout>
  );
}
