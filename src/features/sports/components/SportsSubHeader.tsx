import React, { useMemo, useCallback } from 'react';
import { Button, Badge } from '@/ui';
import { Home, Radio } from 'lucide-react';
import { useSupabaseSportsNav } from '@/features/sports/hooks/useSupabaseSportsNav';
import { logger } from '@/utils/logger';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface SportsSubHeaderProps {
  selectedSport: string;
  onSportSelect: (sportId: string | null) => void;
  activeSection: 'home' | 'matches' | 'live';
  onSectionChange: (section: 'home' | 'matches' | 'live') => void;
  matchCounts?: Record<string, { total: number; live: number; prematch: number }>;
}

export function SportsSubHeader({
  selectedSport,
  onSportSelect,
  activeSection,
  onSectionChange,
  matchCounts,
}: SportsSubHeaderProps) {
  const { sports, totalLive, loading, error } = useSupabaseSportsNav({ matchCounts });
  const { scrollDirection, isAtTop } = useScrollDirection({ threshold: 10 });
  const shouldHide = scrollDirection === 'down' && !isAtTop;

  // Handle sport selection: always filter locally
  const handleSportClick = useCallback((sportSlug: string) => {
    onSportSelect(sportSlug);
    onSectionChange('matches'); // Always switch to matches mode
  }, [onSportSelect, onSectionChange]);

  // Mémoriser le rendu des sports
  const renderedSports = useMemo(() => {
    return sports.map((sport) => {
      const IconComponent = sport.icon;
      const isSelected = selectedSport === sport.slug && activeSection === 'matches';
      
      return (
        <Button
          key={sport.id}
          variant={isSelected ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSportClick(sport.slug)}
          className="flex flex-col items-center gap-1 min-w-[60px] h-auto py-2 px-2 text-xs whitespace-nowrap relative"
        >
          <div className="relative">
            <IconComponent className="w-4 h-4" />
            {sport.prematchCount > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-4 w-4 p-0 text-[8px] flex items-center justify-center rounded-full bg-gold text-gold-foreground border border-gold/30 shadow-lg"
              >
                {sport.prematchCount}
              </Badge>
            )}
          </div>
          <span className="text-[10px] leading-none truncate max-w-[50px]">
            {sport.name}
          </span>
        </Button>
      );
    });
  }, [sports, selectedSport, activeSection, handleSportClick]);

  if (loading) {
    return (
      <div className="border-b border-border/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="animate-pulse">Loading sports...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    logger.error('Error loading sports:', error);
    return (
      <div className="border-b border-border/20">
        <div className="container mx-auto px-4 py-3">
          <div className="text-destructive text-sm">Error loading sports</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/20 transition-transform duration-300 ease-in-out ${
        shouldHide ? '-translate-y-[200%]' : 'translate-y-0'
      }`}
      style={{ top: 'calc(3.5rem + var(--safe-area-inset-top))' }}
    >
      <div className="container mx-auto px-2 py-1">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          <Button
            variant={activeSection === 'home' ? "default" : "ghost"}
            size="sm"
            onClick={() => onSectionChange('home')}
            className="flex flex-col items-center gap-1 min-w-[60px] h-auto py-2 px-2 text-xs whitespace-nowrap"
          >
            <div className="relative">
              <Home className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-none">Home</span>
          </Button>

          <Button
            variant={activeSection === 'live' ? "default" : "ghost"}
            size="sm"
            onClick={() => onSectionChange('live')}
            className="flex flex-col items-center gap-1 min-w-[60px] h-auto py-2 px-2 text-xs whitespace-nowrap"
          >
            <div className="relative">
              <Radio className="w-4 h-4 text-red-500" />
              {totalLive > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-4 w-4 p-0 text-[8px] flex items-center justify-center rounded-full animate-pulse"
                >
                  {totalLive}
                </Badge>
              )}
            </div>
            <span className="text-[10px] leading-none">Live</span>
          </Button>

          {renderedSports}
        </div>
      </div>
    </div>
  );
}