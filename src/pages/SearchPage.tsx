import React, { useCallback } from 'react';
import { Button } from '@/ui';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Feature components
import { SearchBar, CombinedSearchResults } from '@/features/search/components';
import { useGlobalSearch, useSearchHistory, useTrendingTopics, useSuggestedUsers } from '@/features/search/hooks';
import { useFavoriteSports } from '@/features/onboarding/hooks/useFavoriteSports';
import type { SearchUser, SearchLeague, SearchTeam, SearchPlayer, RecentSearch, TrendingTopic, SuggestedUser, PolymarketEventSearchResult } from '@/features/search/types';
import type { SearchTab } from '@/features/search/hooks/useGlobalSearch';

// Constants to prevent object recreation
const TRENDING_TOPICS_OPTIONS = { maxResults: 5 };

const SearchPage = () => {
  const navigate = useNavigate();

  // Get favorite sports for prioritization
  const { favoriteSports } = useFavoriteSports();

  // Global search hook with favorite sports and tab management
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    activeTab,
    setActiveTab,
    users: userResults,
    leagues: leagueResults,
    teams: teamResults,
    players: playerResults,
    markets: marketResults,
    marketTags,
    marketTagsCount,
    isLoading: isSearching,
    clearResults,
    loadMore,
    hasMore
  } = useGlobalSearch(200, favoriteSports);

  const {
    recentSearches,
    addToRecentSearches,
    removeRecentSearch,
    clearRecentSearches: clearAllRecentSearches
  } = useSearchHistory();

  const { topics: trendingTopics } = useTrendingTopics(TRENDING_TOPICS_OPTIONS);
  
  // Dynamic suggested users from RPC (30-minute cache)
  const { data: suggestedUsers = [], isLoading: isSuggestedLoading } = useSuggestedUsers(5);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery);
    }
  }, [searchQuery, addToRecentSearches]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    clearResults();
  }, [setSearchQuery, clearResults]);

  const handleTabChange = useCallback((tab: SearchTab) => {
    setActiveTab(tab);
  }, [setActiveTab]);

  const handleUserClick = useCallback((user: SearchUser) => {
    const displayName = user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}`
      : user.username || 'User';
    addToRecentSearches(displayName, 'user', user);
    navigate(`/user/${user.username}`);
  }, [addToRecentSearches, navigate]);

  const handleLeagueClick = useCallback((league: SearchLeague) => {
    addToRecentSearches(league.league_name, 'league', undefined, league);
    const sportSlug = league.sport_slug || 'sport';
    const leagueSlug = league.league_slug || 'league';
    navigate(`/league/${sportSlug}/${leagueSlug}/${league.league_id}`);
  }, [addToRecentSearches, navigate]);

  const handleTeamClick = useCallback((team: SearchTeam) => {
    addToRecentSearches(team.name, 'team', undefined, undefined, team);
    const sportSlug = team.sport_slug || 'sport';
    const teamSlug = team.slug || 'team';
    navigate(`/team/${sportSlug}/${teamSlug}/${team.id}`);
  }, [addToRecentSearches, navigate]);

  const handlePlayerClick = useCallback((player: SearchPlayer) => {
    addToRecentSearches(player.name, 'player', undefined, undefined, undefined, player);
    navigate(`/player/${player.id}`);
  }, [addToRecentSearches, navigate]);

  const handleMarketClick = useCallback((event: PolymarketEventSearchResult) => {
    const slug = event.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'event';
    navigate(`/polymarket/event/${slug}/${event.id}`);
  }, [navigate]);

  const handleMarketTagClick = useCallback((tag: { label: string }) => {
    setSearchQuery(tag.label);
  }, [setSearchQuery]);

  const handleRecentSearchClick = useCallback((search: RecentSearch) => {
    if (search.type === 'user' && search.userData) {
      navigate(`/user/${search.userData.username}`);
    } else if (search.type === 'league' && search.leagueData) {
      const sportSlug = search.leagueData.sport_slug || 'sport';
      const leagueSlug = search.leagueData.league_slug || 'league';
      navigate(`/league/${sportSlug}/${leagueSlug}/${search.leagueData.league_id}`);
    } else if (search.type === 'team' && search.teamData) {
      const sportSlug = search.teamData.sport_slug || 'sport';
      const teamSlug = search.teamData.slug || 'team';
      navigate(`/team/${sportSlug}/${teamSlug}/${search.teamData.id}`);
    } else if (search.type === 'player' && search.playerData) {
      navigate(`/player/${search.playerData.id}`);
    } else {
      setSearchQuery(search.query);
    }
  }, [navigate, setSearchQuery]);

  const handleTrendingTopicClick = useCallback((topic: TrendingTopic) => {
    setSearchQuery(topic.text);
    addToRecentSearches(topic.text, 'hashtag');
  }, [setSearchQuery, addToRecentSearches]);

  const handleSuggestedUserClick = useCallback((user: SuggestedUser) => {
    navigate(`/user/${user.username}`);
  }, [navigate]);

  const handleFollowClick = useCallback((_user: SuggestedUser) => {
    // TODO: Implement follow logic
  }, []);

  const handleRecentSearchRemove = useCallback((search: RecentSearch) => {
    removeRecentSearch(search.query, search.type);
  }, [removeRecentSearch]);

  const clearRecentSearches = useCallback(() => {
    clearAllRecentSearches();
  }, [clearAllRecentSearches]);

  return (
    <div className="min-h-screen bg-background overflow-y-auto hide-scrollbar" style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
      {/* Header with back arrow */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Search</h1>
          <div className="w-9" />
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Navigation Tabs */}
        <div className="sticky z-20 bg-background/95 backdrop-blur-sm border-b border-border/20 -mx-4 px-4" style={{ top: '3.5rem' }}>
          <nav className="flex justify-center">
            <div className="flex space-x-4">
              {(['users', 'leagues', 'teams', 'players', 'markets'] as const).map((tab) => (
                <button 
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`py-3 border-b-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                    activeTab === tab 
                      ? 'border-primary text-foreground' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'markets' ? 'Markets' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Search bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          onClear={clearSearch}
          size="md"
          variant="default"
          autoFocus={false}
        />

        {/* Single CombinedSearchResults with tab-specific data */}
        <CombinedSearchResults
          query={searchQuery}
          hasQuery={!!searchQuery}
          activeTab={activeTab}
          userResults={activeTab === 'users' ? userResults : []}
          leagueResults={activeTab === 'leagues' ? leagueResults : []}
          teamResults={activeTab === 'teams' ? teamResults : []}
          playerResults={activeTab === 'players' ? playerResults : []}
          marketResults={activeTab === 'markets' ? marketResults : []}
          marketTags={activeTab === 'markets' ? marketTags : []}
          marketTagsCount={activeTab === 'markets' ? marketTagsCount : 0}
          isLoading={isSearching}
          onUserClick={handleUserClick}
          onLeagueClick={handleLeagueClick}
          onTeamClick={handleTeamClick}
          onPlayerClick={handlePlayerClick}
          onMarketClick={handleMarketClick}
          onMarketTagClick={handleMarketTagClick}
          recentSearches={recentSearches}
          onRecentSearchClick={handleRecentSearchClick}
          onRecentSearchRemove={handleRecentSearchRemove}
          onClearAllRecentSearches={clearRecentSearches}
          trendingTopics={trendingTopics}
          onTrendingTopicClick={handleTrendingTopicClick}
          suggestedUsers={suggestedUsers}
          isSuggestedLoading={isSuggestedLoading}
          onSuggestedUserClick={handleSuggestedUserClick}
          onFollowClick={handleFollowClick}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
};

export default SearchPage;
