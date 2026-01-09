import { useState } from 'react';
import { HandballStanding } from '@/types/standings/handball';
import { HandballStandingsRow } from './HandballStandingsRow';
import { StageFilter } from '../StageFilter';
import { filterAndGroupStandings, getUniqueStages } from '@/utils/standings/groupByGroupName';

interface HandballStandingsTableProps {
  standings: HandballStanding[];
}

export function HandballStandingsTable({ standings }: HandballStandingsTableProps) {
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
                    <th className="text-left py-2 md:py-3 px-0.5 md:px-2 text-xs md:text-sm font-semibold text-muted-foreground w-7 md:w-12">Pos</th>
                    <th className="text-left py-2 md:py-3 px-1 md:px-4 text-xs md:text-sm font-semibold text-muted-foreground">Team</th>
                    <th className="text-center py-2 md:py-3 px-0.5 md:px-2 text-xs md:text-sm font-semibold text-muted-foreground w-7 md:w-12">GP</th>
                    <th className="text-center py-2 md:py-3 px-0.5 md:px-2 text-xs md:text-sm font-semibold text-muted-foreground w-6 md:w-12">W</th>
                    <th className="text-center py-2 md:py-3 px-0.5 md:px-2 text-xs md:text-sm font-semibold text-muted-foreground w-6 md:w-12">D</th>
                    <th className="text-center py-2 md:py-3 px-0.5 md:px-2 text-xs md:text-sm font-semibold text-muted-foreground w-6 md:w-12">L</th>
                    <th className="text-center py-2 md:py-3 px-0.5 md:px-2 text-xs md:text-sm font-semibold text-muted-foreground w-8 md:w-16">GF</th>
                    <th className="text-center py-2 md:py-3 px-0.5 md:px-2 text-xs md:text-sm font-semibold text-muted-foreground w-8 md:w-16">GA</th>
                    <th className="text-center py-2 md:py-3 px-0.5 md:px-2 text-xs md:text-sm font-semibold text-muted-foreground w-9 md:w-16">Diff</th>
                    <th className="text-center py-2 md:py-3 px-0.5 md:px-2 text-xs md:text-sm font-semibold text-muted-foreground w-7 md:w-12">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {groupStandings.map((standing) => (
                    <HandballStandingsRow key={standing.id} standing={standing} />
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