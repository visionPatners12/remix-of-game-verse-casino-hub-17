import { FootballStanding } from '@/types/standings/football';
import { getStatusIcon, getGoalDifferenceColor } from '@/utils/standingsUtils';
import { useNavigate } from 'react-router-dom';

interface FootballStandingsMobileProps {
  standings: FootballStanding[];
  countrySlug?: string;
  sportSlug?: string;
}

export function FootballStandingsMobile({ standings, countrySlug, sportSlug }: FootballStandingsMobileProps) {
  const navigate = useNavigate();

  // Group standings by group_name (stored in stage)
  const groupedByStage = standings.reduce((acc, standing) => {
    const stage = standing.stage || '__ungrouped__';
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(standing);
    return acc;
  }, {} as Record<string, FootballStanding[]>);

  const stages = Object.keys(groupedByStage);

  const formatForm = (form?: string) => {
    if (!form) return null;
    
    return form.split('').slice(-3).map((result, index) => (
      <span
        key={index}
        className={`inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded ${
          result === 'W' ? 'bg-success/20 text-success' :
          result === 'D' ? 'bg-warning/20 text-warning' :
          result === 'L' ? 'bg-destructive/20 text-destructive' :
          'bg-muted text-muted-foreground'
        }`}
      >
        {result}
      </span>
    ));
  };

  return (
    <div className="space-y-4">
      {stages.map((stage) => (
        <div key={stage} className="space-y-0">
          {stage !== '__ungrouped__' && (
            <h3 className="text-lg font-semibold mb-2 px-2 text-foreground">{stage}</h3>
          )}
          {/* Headers */}
          <div className="flex items-center justify-between px-2 py-1 bg-muted/30 border-b-2 border-border">
        {/* Position */}
        <div className="w-8 text-center flex-shrink-0">
          <div className="text-xs font-medium text-muted-foreground">#</div>
        </div>

        {/* Team */}
        <div className="flex-1 min-w-0 px-1">
          <div className="text-xs font-medium text-muted-foreground">Team</div>
        </div>

        {/* GP (Games Played) */}
        <div className="w-6 text-center flex-shrink-0">
          <div className="text-xs font-medium text-muted-foreground">GP</div>
        </div>

        {/* W-D-L (Wins-Draws-Losses) */}
        <div className="w-12 text-center flex-shrink-0">
          <div className="text-xs font-medium text-muted-foreground">W-D-L</div>
        </div>

        {/* GF-GA (Goals For-Goals Against) */}
        <div className="w-12 text-center flex-shrink-0">
          <div className="text-xs font-medium text-muted-foreground">GF-GA</div>
        </div>

        {/* +/- */}
        <div className="w-8 text-center flex-shrink-0">
          <div className="text-xs font-medium text-muted-foreground">+/-</div>
        </div>

        {/* Pts */}
        <div className="w-8 text-center flex-shrink-0">
          <div className="text-xs font-medium text-muted-foreground">Pts</div>
        </div>
      </div>

          {/* Data rows */}
          {groupedByStage[stage].map((standing, index) => (
        <div
          key={standing.team.id}
          className="flex items-center px-2 py-2 hover:bg-muted/10 transition-colors border-b border-border/30 last:border-b-0 cursor-pointer"
          onClick={() => navigate(`/team/${standing.team.id}`)}
        >
          {/* Position */}
          <div className="flex flex-col items-center flex-shrink-0 w-8">
            <div className="font-bold text-sm text-foreground">{standing.position}</div>
          </div>

          {/* Team */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0">
              <img
                src={standing.team.logo}
                alt={standing.team.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="font-medium text-xs truncate text-foreground flex-1">
              {standing.team.name}
            </div>
          </div>

          {/* GP */}
          <div className="text-xs text-muted-foreground w-6 text-center flex-shrink-0">
            {standing.played}
          </div>

          {/* W-D-L */}
          <div className="text-xs text-muted-foreground w-12 text-center flex-shrink-0">
            {standing.wins}-{standing.draws}-{standing.losses}
          </div>

          {/* GF-GA */}
          <div className="text-xs text-muted-foreground w-12 text-center flex-shrink-0">
            {standing.goals_for}-{standing.goals_against}
          </div>

          {/* +/- with conditional color */}
          <div className={`text-xs font-semibold w-8 text-center flex-shrink-0 ${
            standing.goal_difference > 0 ? 'text-success' : 
            standing.goal_difference < 0 ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
          </div>

          {/* Pts */}
          <div className="text-xs font-bold text-primary w-8 text-center flex-shrink-0">
            {standing.points}
          </div>
        </div>
          ))}
        </div>
      ))}
    </div>
  );
}