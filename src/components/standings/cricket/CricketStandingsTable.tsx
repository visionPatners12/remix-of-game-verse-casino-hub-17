import { CricketStanding } from '@/types/standings/cricket';
import { Link } from 'react-router-dom';
import { StageFilter } from '../StageFilter';
import { useState } from 'react';
import { filterAndGroupStandings, getUniqueStages } from '@/utils/standings/groupByGroupName';

interface CricketStandingsTableProps {
  standings: CricketStanding[];
}

export function CricketStandingsTable({ standings }: CricketStandingsTableProps) {
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
        <div key={groupName} className="space-y-3">
          {groupName !== '__ungrouped__' && groupNames.length > 1 && (
            <h3 className="text-lg font-semibold text-foreground">{groupName}</h3>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground">Pos</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground">Team</th>
                  <th className="text-center px-1.5 py-2 text-xs font-medium text-muted-foreground">GP</th>
                  <th className="text-center px-1.5 py-2 text-xs font-medium text-muted-foreground">W</th>
                  <th className="text-center px-1.5 py-2 text-xs font-medium text-muted-foreground">L</th>
                  <th className="text-center px-1.5 py-2 text-xs font-medium text-muted-foreground">T</th>
                  <th className="text-center px-1.5 py-2 text-xs font-medium text-muted-foreground">Pts</th>
                  <th className="text-center px-1.5 py-2 text-xs font-medium text-muted-foreground">Runs For</th>
                  <th className="text-center px-1.5 py-2 text-xs font-medium text-muted-foreground">Runs Against</th>
                  <th className="text-center px-1.5 py-2 text-xs font-medium text-muted-foreground">NRR</th>
                </tr>
              </thead>
              <tbody>
                {groups[groupName].map((standing) => (
                  <tr
                    key={standing.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-2 py-2">
                      <span className="text-xs font-semibold text-foreground">{standing.position}</span>
                    </td>
                    <td className="px-2 py-2">
                      <Link
                        to={`/team/${standing.team.slug || standing.team.id}`}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      >
                        {standing.team.logo && (
                          <img
                            src={standing.team.logo}
                            alt={standing.team.name}
                            className="w-5 h-5 object-contain flex-shrink-0"
                          />
                        )}
                        <span className="text-xs font-medium text-foreground truncate">{standing.team.name}</span>
                      </Link>
                    </td>
                    <td className="text-center px-1.5 py-2 text-xs text-foreground">{standing.matchesPlayed}</td>
                    <td className="text-center px-1.5 py-2 text-xs text-foreground">{standing.wins}</td>
                    <td className="text-center px-1.5 py-2 text-xs text-foreground">{standing.losses}</td>
                    <td className="text-center px-1.5 py-2 text-xs text-foreground">{standing.ties}</td>
                    <td className="text-center px-1.5 py-2 text-xs font-semibold text-foreground">{standing.points}</td>
                    <td className="text-center px-1.5 py-2 text-xs text-muted-foreground">{standing.runsFor}</td>
                    <td className="text-center px-1.5 py-2 text-xs text-muted-foreground">{standing.runsAgainst}</td>
                    <td className="text-center px-1.5 py-2 text-xs text-foreground">
                      {standing.netRunRate !== null && standing.netRunRate !== undefined
                        ? standing.netRunRate.toFixed(3)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}