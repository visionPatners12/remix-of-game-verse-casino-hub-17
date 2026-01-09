import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountryFlag } from '@/components/ui/country-flag';
import type { LeagueWithCounts } from '@/features/sports/hooks/useSupabaseLeaguesNav';

interface MobileLiveLeagueDropdownProps {
  leagues: LeagueWithCounts[];
  selectedLeague: { slug: string; country: string } | null;
  onLeagueSelect: (league: { slug: string; country: string } | null) => void;
  totalMatches: number;
}

export const MobileLiveLeagueDropdown: React.FC<MobileLiveLeagueDropdownProps> = ({
  leagues,
  selectedLeague,
  onLeagueSelect,
  totalMatches
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLeagueData = selectedLeague
    ? leagues.find(l => l.slug === selectedLeague.slug && l.country_name === selectedLeague.country)
    : null;

  const handleSelect = (league: LeagueWithCounts | null) => {
    if (league) {
      onLeagueSelect({ slug: league.slug, country: league.country_name || '' });
    } else {
      onLeagueSelect(null);
    }
    setIsOpen(false);
  };

  return (
    <div className="px-4 py-2 border-b border-border/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg"
      >
        <div className="flex items-center gap-2">
          {selectedLeagueData ? (
            <>
              {selectedLeagueData.country_name && (
                <CountryFlag
                  countrySlug={selectedLeagueData.country_slug || ''}
                  countryName={selectedLeagueData.country_name}
                  size={16}
                />
              )}
              <span className="font-medium text-sm">{selectedLeagueData.name}</span>
              <span className="text-xs text-muted-foreground">({selectedLeagueData.activeGamesCount})</span>
            </>
          ) : (
            <>
              <span className="font-medium text-sm">All leagues</span>
              <span className="text-xs text-muted-foreground">({totalMatches})</span>
            </>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 max-h-64 overflow-y-auto rounded-lg bg-background border border-border/20">
              {/* All leagues option */}
              <button
                onClick={() => handleSelect(null)}
                className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 transition-colors ${
                  !selectedLeague ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                <span className="text-sm font-medium">All leagues</span>
                <span className="text-xs text-muted-foreground">{totalMatches}</span>
              </button>

              {/* League list */}
              {leagues.map((league) => {
                const isSelected = selectedLeague?.slug === league.slug && 
                                   selectedLeague?.country === league.country_name;
                return (
                  <button
                    key={league.id}
                    onClick={() => handleSelect(league)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 transition-colors border-t border-border/10 ${
                      isSelected ? 'bg-primary/10 text-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {league.country_name && (
                        <CountryFlag
                          countrySlug={league.country_slug || ''}
                          countryName={league.country_name}
                          size={16}
                        />
                      )}
                      <span className="text-sm">{league.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{league.activeGamesCount}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
