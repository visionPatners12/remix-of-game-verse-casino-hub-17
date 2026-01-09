import { useState } from 'react';
import { VolleyballStanding } from '@/types/standings/volleyball';
import { VolleyballStandingsRow } from './VolleyballStandingsRow';
import { StageFilter } from '../StageFilter';
import { filterAndGroupStandings, getUniqueStages } from '@/utils/standings/groupByGroupName';

interface VolleyballStandingsTableProps {
  standings: VolleyballStanding[];
}

export function VolleyballStandingsTable({ standings }: VolleyballStandingsTableProps) {
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
              <h3 className="text-sm md:text-base font-semibold mb-2 px-2 text-foreground">
                {groupName}
              </h3>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground w-8 sm:w-12">Pos</th>
                    <th className="text-left py-2 px-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground min-w-[120px] sm:min-w-[180px]">Team</th>
                    <th className="text-center py-2 px-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground w-8 sm:w-12">GP</th>
                    <th className="text-center py-2 px-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground w-8 sm:w-12">W</th>
                    <th className="text-center py-2 px-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground w-8 sm:w-12">L</th>
                    <th className="text-center py-2 px-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground w-8 sm:w-12">SW</th>
                    <th className="text-center py-2 px-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground w-8 sm:w-12">SL</th>
                    <th className="text-center py-2 px-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground w-10 sm:w-14">Diff</th>
                    <th className="text-center py-2 px-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground w-8 sm:w-12">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {groupStandings.map((standing) => (
                    <VolleyballStandingsRow key={standing.id} standing={standing} />
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