import { TeamStandingDisplay } from '../../../hooks/useTeamStandingsForDisplay';

interface FootballStatsCardProps {
  standing: TeamStandingDisplay;
}

export function FootballStatsCard({ standing }: FootballStatsCardProps) {
  const stats = standing.raw_stats || {};
  const total = stats.total || {};
  const home = stats.home || {};
  const away = stats.away || {};

  return (
    <div className="space-y-3 px-4">
      {/* Header with Rank and Points */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          {standing.rank && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {standing.rank}
            </div>
          )}
          {standing.group_name && (
            <span className="text-sm text-muted-foreground">{standing.group_name}</span>
          )}
        </div>
        <span className="text-sm font-bold text-primary">{stats.points ?? 0} pts</span>
      </div>

      {/* Stats Grid - No scroll */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="bg-muted/30 rounded-lg p-2">
          <div className="text-lg font-bold">{total.games ?? 0}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Played</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-2">
          <div className="text-lg font-bold text-success">{total.wins ?? 0}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Wins</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-2">
          <div className="text-lg font-bold text-muted-foreground">{total.draws ?? 0}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Draws</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-2">
          <div className="text-lg font-bold text-destructive">{total.loses ?? 0}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Losses</div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/20 rounded-lg p-2">
          <div className="text-base font-semibold">{total.scoredGoals ?? 0}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Goals For</div>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <div className="text-base font-semibold">{total.receivedGoals ?? 0}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Goals Against</div>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <div className={`text-base font-bold ${(total.scoredGoals || 0) - (total.receivedGoals || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
            {(total.scoredGoals || 0) - (total.receivedGoals || 0) > 0 ? '+' : ''}{(total.scoredGoals || 0) - (total.receivedGoals || 0)}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase">Diff</div>
        </div>
      </div>

      {/* Home/Away Stats */}
      {(home.games || away.games) && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-muted/10 rounded-lg p-2 space-y-1">
            <div className="font-medium text-muted-foreground text-center">Home</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GP</span>
              <span>{home.games ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">W-D-L</span>
              <span>{home.wins ?? 0}-{home.draws ?? 0}-{home.loses ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goals</span>
              <span>{home.scoredGoals ?? 0}:{home.receivedGoals ?? 0}</span>
            </div>
          </div>
          <div className="bg-muted/10 rounded-lg p-2 space-y-1">
            <div className="font-medium text-muted-foreground text-center">Away</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GP</span>
              <span>{away.games ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">W-D-L</span>
              <span>{away.wins ?? 0}-{away.draws ?? 0}-{away.loses ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goals</span>
              <span>{away.scoredGoals ?? 0}:{away.receivedGoals ?? 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
