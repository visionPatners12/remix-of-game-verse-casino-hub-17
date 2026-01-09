import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SportWithTeams } from '@/hooks/useTopTeamsBySport';
import { SelectionCard } from './SelectionCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface SportTeamDropdownProps {
  sport: SportWithTeams;
  selectedTeamIds: string[];
  onTeamToggle: (teamId: string) => void;
  maxSelections: number;
  disabled?: boolean;
}

export const SportTeamDropdown = ({
  sport,
  selectedTeamIds,
  onTeamToggle,
  maxSelections,
  disabled = false,
}: SportTeamDropdownProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const toggleExpanded = () => {
    if (!disabled) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={isMobile ? "overflow-hidden" : "border border-border/60 rounded-xl overflow-hidden bg-card"}>
      {/* Sport Header */}
      <button
        onClick={toggleExpanded}
        disabled={disabled}
        className={`w-full flex items-center justify-between text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isMobile 
            ? "p-4 hover:bg-muted/30 border-b border-border/30 bg-background" 
            : "p-4 hover:bg-muted/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {sport.sportName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{sport.sportName}</h3>
            <p className="text-sm text-muted-foreground">
              {sport.teamCount} {sport.teamCount === 1 ? 'team' : 'teams'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Selected count for this sport */}
          {(() => {
            const selectedFromThisSport = sport.teams.filter(team => 
              selectedTeamIds.includes(team.id)
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

      {/* Teams List */}
      {isExpanded && (
        <div className={isMobile ? "px-4 pb-4 space-y-2 bg-background" : "border-t border-border/60 p-4 space-y-3 bg-muted/20"}>
          {sport.teams.map((team) => {
            const isSelected = selectedTeamIds.includes(team.id);
            const isDisabled = disabled || (!isSelected && selectedTeamIds.length >= maxSelections);

            return (
              <SelectionCard
                key={team.id}
                id={team.id}
                name={team.title}
                logo={team.logo}
                description={team.countryName}
                isSelected={isSelected}
                onToggle={onTeamToggle}
                disabled={isDisabled}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};