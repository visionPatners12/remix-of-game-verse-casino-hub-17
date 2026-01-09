import React, { useMemo } from "react";
import { OddsButton } from "@/shared/ui/buttons";
import { ConditionState } from "@/types";
import { Pause } from "lucide-react";
import type { Market, MarketOutcome } from '@azuro-org/toolkit';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import {
  getCompoundMarketConfig,
  parseCompoundSelection,
  normalizeLabel,
  formatColumnLabel,
  formatRowLabel
} from '../utils/compoundMarketUtils';

interface CompoundMarketGridProps {
  market: Market;
  outcomes: MarketOutcome[];
  onSelect: (outcome: MarketOutcome) => void;
  isSelected: (outcome: MarketOutcome) => boolean;
  disabled: boolean;
  match: SupabaseMatchData;
  conditionState: ConditionState;
}

export const CompoundMarketGrid: React.FC<CompoundMarketGridProps> = ({
  market,
  outcomes,
  onSelect,
  isSelected,
  disabled,
  match,
  conditionState
}) => {
  const config = getCompoundMarketConfig(market.name);
  
  const teamAName = match.home;
  const teamBName = match.away;
  const eventName = `${teamAName} vs ${teamBName}`;

  // Organize outcomes into a 2D grid matrix
  const grid = useMemo(() => {
    if (!config) return null;
    
    const matrix: Record<string, Record<string, MarketOutcome>> = {};
    
    // Initialize matrix with empty rows
    config.rowLabels.forEach(row => {
      matrix[row] = {};
    });
    
    // Fill matrix with outcomes
    outcomes.forEach(outcome => {
      const parsed = parseCompoundSelection(outcome.selectionName || '');
      if (!parsed) return;
      
      // Find matching row label
      const rowMatch = config.rowLabels.find(
        label => normalizeLabel(label) === normalizeLabel(parsed.row)
      );
      
      // Find matching column label
      const colMatch = config.columnLabels.find(
        label => normalizeLabel(label) === normalizeLabel(parsed.col)
      );
      
      if (rowMatch && colMatch) {
        matrix[rowMatch][colMatch] = outcome;
      }
    });
    
    return matrix;
  }, [outcomes, config]);

  // Fallback if config not found - shouldn't happen but safety first
  if (!config || !grid) {
    return null;
  }

  const colCount = config.columnLabels.length;
  const isStopped = conditionState === 'Stopped';

  return (
    <div className="space-y-1 relative">
      {/* Pause overlay for stopped markets */}
      {isStopped && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Pause className="h-5 w-5" />
            <span className="text-sm font-medium">Suspended</span>
          </div>
        </div>
      )}
      
      {/* Header row with column labels */}
      <div 
        className="grid gap-1.5 items-center"
        style={{ gridTemplateColumns: `72px repeat(${colCount}, 1fr)` }}
      >
        {/* Empty corner cell */}
        <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wide px-1">
          {config.rowHeader}
        </div>
        
        {/* Column headers */}
        {config.columnLabels.map(label => (
          <div 
            key={label} 
            className="text-center text-xs text-muted-foreground font-medium py-1 truncate px-1"
            title={formatColumnLabel(label, teamAName, teamBName)}
          >
            {formatColumnLabel(label, teamAName, teamBName)}
          </div>
        ))}
      </div>
      
      {/* Data rows */}
      {config.rowLabels.map(rowLabel => (
        <div 
          key={rowLabel} 
          className="grid gap-1.5 items-center"
          style={{ gridTemplateColumns: `72px repeat(${colCount}, 1fr)` }}
        >
          {/* Row label */}
          <div className="flex items-center text-xs font-medium text-muted-foreground px-1">
            {formatRowLabel(rowLabel)}
          </div>
          
          {/* Outcome buttons */}
          {config.columnLabels.map((colLabel, colIndex) => {
            const outcome = grid[rowLabel]?.[colLabel];
            
            // Determine teamType based on column position/label
            const getTeamType = (): 'home' | 'draw' | 'away' => {
              const normalizedCol = colLabel.toLowerCase();
              // Check for explicit result labels
              if (normalizedCol === '1' || normalizedCol === 'home') return 'home';
              if (normalizedCol === 'x' || normalizedCol === 'draw') return 'draw';
              if (normalizedCol === '2' || normalizedCol === 'away') return 'away';
              // For 3-column grids (like 1/X/2), use position
              if (colCount === 3) {
                if (colIndex === 0) return 'home';
                if (colIndex === 1) return 'draw';
                if (colIndex === 2) return 'away';
              }
              // For 2-column grids (Over/Under), alternate
              if (colIndex === 0) return 'home';
              return 'away';
            };
            
            if (!outcome) {
              return (
                <div 
                  key={colLabel} 
                  className="h-10 bg-muted/20 rounded-md flex items-center justify-center text-xs text-muted-foreground/50"
                >
                  -
                </div>
              );
            }
            
            return (
              <OddsButton
                key={outcome.outcomeId}
                variant="sport"
                odds={outcome.odds}
                label="" // No label needed - headers provide context
                outcome={outcome}
                teamType={getTeamType()}
                isSelected={isSelected(outcome)}
                disabled={disabled}
                onSelect={() => onSelect(outcome)}
                gameId={match.azuro_game_id || match.id}
                eventName={eventName}
                marketType={market.name}
                participants={[
                  { name: teamAName, image: match.home_team?.logo || null },
                  { name: teamBName, image: match.away_team?.logo || null }
                ]}
                sport={match.sport ? { name: match.sport.name, slug: match.sport.slug } : undefined}
                league={match.league_info ? { 
                  name: match.league_info.name, 
                  slug: match.league_info.slug,
                  logo: match.league_info.logo 
                } : { 
                  name: match.league, 
                  slug: match.league_azuro_slug || '' 
                }}
                startsAt={match.start_iso}
                className="w-full h-10"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
