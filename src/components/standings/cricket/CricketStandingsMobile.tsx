import { CricketStanding } from '@/types/standings/cricket';
import { Link } from 'react-router-dom';
import { StageFilter } from '../StageFilter';
import { useState } from 'react';
import { filterAndGroupStandings, getUniqueStages } from '@/utils/standings/groupByGroupName';

interface CricketStandingsMobileProps {
  standings: CricketStanding[];
}

export function CricketStandingsMobile({ standings }: CricketStandingsMobileProps) {
  const stages = getUniqueStages(standings, 'General');
  const [selectedStage, setSelectedStage] = useState<string | null>(
    stages.length > 0 ? stages[0]! : null
  );

  const { groups, groupNames } = filterAndGroupStandings(
    standings,
    selectedStage,
    'General',
    '__ungrouped__'
  );

  return (
    <div className="space-y-6">
      {stages.length > 1 && (
        <StageFilter
          stages={stages}
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
        />
      )}

      {groupNames.map(groupName => (
        <div key={groupName} className="space-y-2">
          {groupName !== '__ungrouped__' && groupNames.length > 1 && (
            <h3 className="text-sm font-semibold text-foreground px-2">{groupName}</h3>
          )}
          
          {/* Header */}
          <div className="flex items-center gap-1 px-2 py-2 border-b border-border text-[10px] font-medium text-muted-foreground">
            <span className="w-6 text-center">#</span>
            <span className="flex-1 min-w-0">Team</span>
            <span className="w-7 text-center">GP</span>
            <span className="w-14 text-center">W-L-T</span>
            <span className="w-8 text-center">Pts</span>
            <span className="w-12 text-center">NRR</span>
          </div>

          {/* Rows */}
          {groups[groupName].map((standing) => (
            <div
              key={standing.id}
              className="flex items-center gap-1 px-2 py-2 border-b border-border"
            >
              <span className="w-6 text-center text-xs font-semibold text-foreground">
                {standing.position}
              </span>
              
              <Link
                to={`/team/${standing.team.slug || standing.team.id}`}
                className="flex-1 min-w-0 flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                {standing.team.logo && (
                  <img
                    src={standing.team.logo}
                    alt={standing.team.name}
                    className="w-5 h-5 object-contain flex-shrink-0"
                  />
                )}
                <span className="text-xs font-medium text-foreground truncate">
                  {standing.team.name}
                </span>
              </Link>
              
              <span className="w-7 text-center text-xs text-foreground">
                {standing.matchesPlayed}
              </span>
              
              <span className="w-14 text-center text-xs text-foreground">
                {standing.wins}-{standing.losses}-{standing.ties}
              </span>
              
              <span className="w-8 text-center text-xs font-semibold text-foreground">
                {standing.points}
              </span>
              
              <span className="w-12 text-center text-xs text-muted-foreground">
                {standing.netRunRate !== null && standing.netRunRate !== undefined
                  ? (standing.netRunRate >= 0 ? '+' : '') + standing.netRunRate.toFixed(2)
                  : '-'}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
