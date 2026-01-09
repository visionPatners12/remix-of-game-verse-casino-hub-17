import React, { useState } from 'react';
import { Crown, Search, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TipsterRow } from '@/features/tipster/components';
import { EnhancedSportsNavbar } from '@/components/navigation/EnhancedSportsNavbar';
import { useTipsterLeaderboard, TimeFrame } from '@/features/tipster/hooks';
import { SortField } from '@/features/tipster/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function TipsterLeaderboardPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<TimeFrame>('all');
  
  const {
    filters,
    filteredAndSortedTipsters,
    handleSort,
    handleSearch,
    handleSportChange,
    handleTipsterClick,
    isLoading,
    error
  } = useTipsterLeaderboard(timeframe);

  const getSortIcon = (field: SortField) => {
    if (filters.sortBy !== field) return null;
    return filters.sortDirection === 'desc' ? (
      <ArrowDown className="h-4 w-4" />
    ) : (
      <ArrowUp className="h-4 w-4" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-safe">
      {/* Top Bar - Search + Filters */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 pt-safe">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 py-4 pl-safe pr-safe">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div className="p-2 rounded-xl bg-primary/10">
              <Crown className="h-4 w-4 md:h-6 md:w-6 text-primary" />
            </div>
            <h1 className="text-base md:text-2xl font-bold">Leaderboard {!isMobile && 'Tipsters'}</h1>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Search Bar + Timeframe */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-shrink-0 w-full md:w-60">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tipster..."
                  value={filters.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-10 bg-background/50 border-border/50"
                />
              </div>

              {/* Timeframe Selector */}
              <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeFrame)} className="flex-shrink-0">
                <TabsList>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Sort Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={filters.sortBy === 'winRate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('winRate')}
                className="flex-shrink-0 gap-2"
              >
                Win Rate
                {getSortIcon('winRate')}
              </Button>
              <Button
                variant={filters.sortBy === 'winRate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('winRate')}
                className="flex-shrink-0 gap-2"
              >
                Win Rate
                {getSortIcon('winRate')}
              </Button>
              <Button
                variant={filters.sortBy === 'tips' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('tips')}
                className="flex-shrink-0 gap-2"
              >
                Tips
                {getSortIcon('tips')}
              </Button>
              <Button
                variant={filters.sortBy === 'avgOdds' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('avgOdds')}
                className="flex-shrink-0 gap-2"
              >
                Avg Odds
                {getSortIcon('avgOdds')}
              </Button>
              <Button
                variant={filters.sortBy === 'form' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('form')}
                className="flex-shrink-0 gap-2"
              >
                Form
                {getSortIcon('form')}
              </Button>
              <Button
                variant={filters.sortBy === 'openTips' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('openTips')}
                className="flex-shrink-0 gap-2"
              >
                Open
                {getSortIcon('openTips')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Sports Navigation Bar - Sub navbar */}
      <EnhancedSportsNavbar 
        activeSport={filters.selectedSport}
        onSportChange={handleSportChange}
      />
      {/* Tipster List */}
      <div className="max-w-7xl mx-auto py-4 md:py-6 px-safe">
        <div className="overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-[60px_200px_1fr_1fr_1fr_120px_80px_80px] gap-4 px-4 md:px-6 py-3 bg-muted/20 border-b border-border/20 text-xs font-semibold text-muted-foreground uppercase">
            <div className="text-center">Rank</div>
            <div>Tipster</div>
            <div className="text-center">Win Rate</div>
            <div className="text-center">Tips</div>
            <div className="text-center">Avg. Odds</div>
            <div className="text-center">Form</div>
            <div className="text-center">Open</div>
            <div></div>
          </div>
          
          {/* Tipster Rows */}
          {filteredAndSortedTipsters.length > 0 ? (
            <div className="divide-y divide-border/20">
              {filteredAndSortedTipsters.map((tipster, index) => (
                <TipsterRow
                  key={tipster.id}
                  tipster={tipster}
                  onClick={handleTipsterClick}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Crown className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tipster found</h3>
              <p className="text-muted-foreground">
                Try changing your search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}