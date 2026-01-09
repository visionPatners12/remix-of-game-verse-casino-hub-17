import { useState } from 'react';
import { HockeyStanding } from '@/types/standings/hockey';
import { HockeyStandingsRow } from './HockeyStandingsRow';
import { StageFilter } from '../StageFilter';
import { filterAndGroupStandings, getUniqueStages } from '@/utils/standings/groupByGroupName';

interface HockeyStandingsTableProps {
  standings: HockeyStanding[];
}

export function HockeyStandingsTable({ standings }: HockeyStandingsTableProps) {
  const stages = getUniqueStages(standings, 'General');
  const [selectedStage, setSelectedStage] = useState(stages[0]);

  const { groups, groupNames } = filterAndGroupStandings(
    standings,
    selectedStage,
    'General',
    '__ungrouped__'
  );

  return (
    <div className="w-full">
      <StageFilter 
        stages={stages}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
      />

      {groupNames.map((groupName) => {
        const groupStandings = groups[groupName];
        
        return (
          <div key={groupName} className="mb-6">
            {groupName !== '__ungrouped__' && groupNames.length > 1 && (
              <h3 className="text-sm font-semibold text-foreground mb-2">{groupName}</h3>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left px-1 md:px-2 py-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      Pos
                    </th>
                    <th className="text-left px-1 md:px-2 py-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      Team
                    </th>
                    <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      GP
                    </th>
                    <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      W
                    </th>
                    <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      OTW
                    </th>
                    <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      OTL
                    </th>
                    <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      L
                    </th>
                    <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      GF
                    </th>
                    <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      GA
                    </th>
                    <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      +/-
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupStandings.map((standing) => (
                    <HockeyStandingsRow key={standing.id} standing={standing} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}