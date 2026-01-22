import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SportWithLeagues } from '@/hooks/useTopLeaguesBySport';
import { SelectionCard } from './SelectionCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { getSportIcon } from '@/lib/sportIconsLite';

interface SportLeagueDropdownProps {
  sport: SportWithLeagues;
  selectedLeagueIds: string[];
  onLeagueToggle: (leagueId: string) => void;
  maxSelections: number;
  disabled?: boolean;
}

export const SportLeagueDropdown = ({
  sport,
  selectedLeagueIds,
  onLeagueToggle,
  maxSelections,
  disabled = false,
}: SportLeagueDropdownProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  
  // Get sport icon from sports mapping
  const SportIcon = getSportIcon(null); // Use default icon

  const toggleExpanded = () => {
    if (!disabled) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={isMobile ? "overflow-hidden mb-2" : "border border-border/60 rounded-xl overflow-hidden bg-card"}>
      {/* Sport Header */}
      <button
        onClick={toggleExpanded}
        disabled={disabled}
        className={`w-full flex items-center justify-between text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isMobile 
            ? "p-4 hover:bg-muted/30 bg-card rounded-xl border border-border/40 active:scale-[0.98]" 
            : "p-4 hover:bg-muted/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <SportIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{sport.sportName}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Selected count for this sport */}
          {(() => {
            const selectedFromThisSport = sport.leagues.filter(league => 
              selectedLeagueIds.includes(league.id)
            ).length;
            
            return selectedFromThisSport > 0 ? (
              <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                {selectedFromThisSport}
              </span>
            ) : null;
          })()}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Leagues List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={isMobile ? "px-2 pb-3 grid grid-cols-1 gap-2 bg-background/50 rounded-b-xl overflow-hidden -mt-2 pt-2" : "border-t border-border/60 p-4 space-y-3 bg-muted/20"}
          >
            {sport.leagues.map((league) => {
            const isSelected = selectedLeagueIds.includes(league.id);
            const isDisabled = disabled || (!isSelected && selectedLeagueIds.length >= maxSelections);

            return (
              <SelectionCard
                key={league.id}
                id={league.id}
                name={league.title}
                logo={league.logo}
                description={league.countryName}
                isSelected={isSelected}
                onToggle={onLeagueToggle}
                disabled={isDisabled}
              />
            );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};