import { cn } from '@/lib/utils';

interface StandingData {
  id: string;
  season: number;
  rank: number;
  games_played?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  win_pct?: number;
  goals_for?: number;
  goals_against?: number;
  goal_diff?: number;
  points?: number;
  form?: string;
  description?: string;
  league?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  sport?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface TeamStandingsProps {
  standings: StandingData[];
}

export function TeamStandings({ standings }: TeamStandingsProps) {
  if (standings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No standings available</p>
      </div>
    );
  }

  // Group by league and season
  const groupedStandings = standings.reduce((acc, standing) => {
    const key = `${standing.league?.id}-${standing.season}`;
    if (!acc[key]) {
      acc[key] = {
        league: standing.league,
        season: standing.season,
        standings: []
      };
    }
    acc[key].standings.push(standing);
    return acc;
  }, {} as Record<string, { league: any, season: number, standings: StandingData[] }>);

  const formatForm = (form?: string) => {
    if (!form) return null;
    
    return form.split('').slice(-5).map((result, index) => (
      <span
        key={index}
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded",
          result === 'W' && "bg-green-600 text-white",
          result === 'D' && "bg-muted text-muted-foreground",
          result === 'L' && "bg-red-600 text-white"
        )}
      >
        {result}
      </span>
    ));
  };

  return (
    <div className="space-y-3">
      {Object.values(groupedStandings).map((group, groupIndex) => (
        <div key={groupIndex} className="border-y border-border/40 overflow-hidden">
          {/* League Header */}
          <div className="bg-muted/30 px-3 py-2 border-b flex items-center gap-2">
            {group.league?.logo && (
              <img 
                src={group.league.logo} 
                alt={group.league.name}
                className="w-5 h-5 object-contain" 
              />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">{group.league?.name}</h3>
              <p className="text-xs text-muted-foreground">Season {group.season}</p>
            </div>
          </div>

          {/* Table Headers */}
          <div className="flex items-center px-3 py-2 bg-muted/20 border-b text-xs font-medium text-muted-foreground">
            <div className="w-10 text-center flex-shrink-0">#</div>
            <div className="w-12 text-center flex-shrink-0 px-2">GP</div>
            <div className="w-20 text-center flex-shrink-0 px-2">W-D-L</div>
            <div className="w-20 text-center flex-shrink-0 px-2">GF-GA</div>
            <div className="flex-1 text-center px-2">Form</div>
          </div>

          {/* Data Rows */}
          {group.standings.map((standing) => (
            <div
              key={standing.id}
              className="flex items-center px-3 py-2 hover:bg-accent/30 transition-colors border-b border-border/40 last:border-b-0"
            >
              {/* Position */}
              <div className="w-10 text-center flex-shrink-0">
                <span className="font-bold text-base text-primary">{standing.rank}</span>
              </div>

              {/* Matches Played */}
              <div className="w-12 text-center flex-shrink-0 px-2">
                <span className="text-sm text-foreground font-medium">
                  {standing.games_played || '-'}
                </span>
              </div>

              {/* W-D-L */}
              <div className="w-20 text-center flex-shrink-0 px-2">
                <span className="text-sm text-foreground font-medium">
                  {standing.wins || 0}-{standing.draws || 0}-{standing.losses || 0}
                </span>
              </div>

              {/* Goals For-Against */}
              <div className="w-20 text-center flex-shrink-0 px-2">
                <span className="text-sm text-foreground font-medium">
                  {standing.goals_for || 0}-{standing.goals_against || 0}
                </span>
              </div>

              {/* Form */}
              <div className="flex-1 flex items-center justify-center gap-1 px-2">
                {standing.form ? (
                  formatForm(standing.form)
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            </div>
          ))}

          {/* Additional Stats Section */}
          {group.standings.some(s => s.description || s.goal_diff !== undefined || s.win_pct !== undefined) && (
            <div className="bg-muted/10 px-3 py-2 border-t">
              {group.standings.map((standing) => (
                <div key={`${standing.id}-details`} className="text-xs space-y-1">
                  {standing.goal_diff !== undefined && standing.goal_diff !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Goal difference:</span>
                      <span className={cn(
                        "font-medium",
                        standing.goal_diff > 0 ? "text-green-600" : 
                        standing.goal_diff < 0 ? "text-red-600" : 
                        "text-muted-foreground"
                      )}>
                        {standing.goal_diff > 0 ? '+' : ''}{standing.goal_diff}
                      </span>
                    </div>
                  )}
                  {standing.win_pct !== undefined && standing.win_pct !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win %:</span>
                      <span className="font-medium">{(standing.win_pct * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {standing.description && (
                    <div className="pt-1 border-t border-border/30 mt-2">
                      <p className="text-muted-foreground italic">{standing.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
