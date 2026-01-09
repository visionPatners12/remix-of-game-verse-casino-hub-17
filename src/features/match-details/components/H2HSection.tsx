import React, { memo, useState } from 'react';
import { Swords, ChevronDown } from 'lucide-react';
import { LoadingSpinner } from '@/ui';
import { useH2H } from '../hooks/useH2H';
import { H2HMatchRow } from './H2HMatchRow';
import { CricketH2HMatchRow } from './CricketH2HMatchRow';
import { BasketballH2HMatchRow } from './BasketballH2HMatchRow';
import { VolleyballH2HMatchRow } from './VolleyballH2HMatchRow';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface H2HSectionProps {
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  sportSlug?: string; // 'football' | 'american-football' | 'basketball' etc.
  leagueSlug?: string; // For basketball: determines NBA vs generic endpoint
}

export const H2HSection = memo(function H2HSection({ 
  homeTeamId, 
  awayTeamId,
  homeTeamName,
  awayTeamName,
  sportSlug = 'football',
  leagueSlug
}: H2HSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading, error } = useH2H({ 
    homeTeamId, 
    awayTeamId, 
    limit: 5,
    sport: sportSlug,
    leagueSlug
  });

  if (!homeTeamId || !awayTeamId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="border-b border-border">
        <div className="flex items-center justify-center py-3">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { summary, matches } = data;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border-b border-border">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <Swords className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">H2H</span>
              
              {/* Compact inline stats */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-primary font-semibold">{summary.homeWins}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground font-medium">{summary.draws}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-destructive font-semibold">{summary.awayWins}</span>
              </div>
            </div>
            
            <ChevronDown 
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {/* Expanded summary with team names */}
          <div className="flex items-center justify-center gap-4 py-3 px-3 border-t border-border bg-muted/20">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-primary">{summary.homeWins}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
                {homeTeamName || 'Home'}
              </span>
            </div>
            <div className="flex flex-col items-center px-3">
              <span className="text-lg font-bold text-muted-foreground">{summary.draws}</span>
              <span className="text-[10px] text-muted-foreground">Draws</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-destructive">{summary.awayWins}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
                {awayTeamName || 'Away'}
              </span>
            </div>
          </div>

          {/* Match List */}
          {matches.length > 0 ? (
            <div className="divide-y divide-border">
              {matches.map((match) => {
                if (sportSlug === 'cricket') {
                  return (
                    <CricketH2HMatchRow 
                      key={match.id} 
                      match={match} 
                      currentHomeTeamId={homeTeamId}
                    />
                  );
                } else if (sportSlug === 'basketball' || sportSlug === 'nba') {
                  return (
                    <BasketballH2HMatchRow 
                      key={match.id} 
                      match={match} 
                      currentHomeTeamId={homeTeamId}
                    />
                  );
                } else if (sportSlug === 'volleyball') {
                  return (
                    <VolleyballH2HMatchRow 
                      key={match.id} 
                      match={match} 
                      currentHomeTeamId={homeTeamId}
                    />
                  );
                } else {
                  return (
                    <H2HMatchRow 
                      key={match.id} 
                      match={match} 
                      currentHomeTeamId={homeTeamId}
                    />
                  );
                }
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              No previous meetings found
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
});
