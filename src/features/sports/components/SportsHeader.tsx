import React from 'react';
import { SportsSubHeader } from './SportsSubHeader';

interface SportsHeaderProps {
  selectedSport: string;
  onSportSelect: (sportId: string | null) => void;
  showLive: boolean;
  onLiveToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeSection: 'home' | 'matches' | 'live';
  onSectionChange: (section: 'home' | 'matches' | 'live') => void;
  matchCounts?: Record<string, { total: number; live: number; prematch: number }>;
}

export function SportsHeader({
  selectedSport,
  onSportSelect,
  activeSection,
  onSectionChange,
  matchCounts
}: SportsHeaderProps) {
  return (
    <SportsSubHeader
      selectedSport={selectedSport}
      onSportSelect={onSportSelect}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
      matchCounts={matchCounts}
    />
  );
}
