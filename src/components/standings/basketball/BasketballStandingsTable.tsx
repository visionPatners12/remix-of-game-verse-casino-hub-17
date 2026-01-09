import { BasketballStanding } from '@/types/standings/basketball';
import { BasketballStandingsRow } from './BasketballStandingsRow';
import { ConferenceFilter } from '../ConferenceFilter';
import { useState, useMemo } from 'react';
import { groupStandingsByGroupName } from '@/utils/standings/groupByGroupName';

interface BasketballStandingsTableProps {
  standings: BasketballStanding[];
}

// Distinct color palette
const COLOR_PALETTE = [
  '#10b981', // emerald
  '#ec4899', // pink
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f97316', // orange
  '#3b82f6', // blue
  '#84cc16', // lime
  '#ef4444', // red
];

function getUniqueDescriptions(standings: BasketballStanding[]): Array<{ description: string; color: string }> {
  const uniqueDescriptions = [...new Set(standings.map(s => s.description).filter(Boolean))];
  return uniqueDescriptions.map((description, index) => ({
    description: description!,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length]
  }));
}

function getColorForStanding(standing: BasketballStanding, allDescriptions: string[]): string | undefined {
  if (!standing.description) return undefined;
  const index = allDescriptions.indexOf(standing.description);
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export function BasketballStandingsTable({ standings }: BasketballStandingsTableProps) {
  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  
  // Extract unique conferences
  const conferences = useMemo(() => {
    const uniqueConfs = [...new Set(standings.map(s => s.conference).filter(Boolean))];
    return uniqueConfs.sort();
  }, [standings]);
  
  // Filter standings by conference
  const filteredStandings = useMemo(() => {
    if (!selectedConference) return standings;
    return standings.filter(s => s.conference === selectedConference);
  }, [standings, selectedConference]);
  
  // Group standings by group_name
  const groupedByGroup = groupStandingsByGroupName(filteredStandings);
  const groups = Object.keys(groupedByGroup);

  return (
    <div className="w-full">
      {/* Conference Filter - only show if more than 1 conference */}
      {conferences.length > 1 && (
        <ConferenceFilter
          conferences={conferences}
          selectedConference={selectedConference}
          onConferenceChange={setSelectedConference}
        />
      )}
      
      
      {groups.map((group) => {
        const groupStandings = groupedByGroup[group];
        const uniqueDescriptions = getUniqueDescriptions(groupStandings);
        const allDescriptions = uniqueDescriptions.map(d => d.description);
        
        return (
          <div key={group} className="mb-6">
            {group !== '__ungrouped__' && (
              <h3 className="text-sm md:text-base font-semibold mb-2 px-2 text-foreground">{group}</h3>
            )}
            
            {uniqueDescriptions.length > 0 && (
              <div className="mb-2 px-2 flex flex-wrap gap-2 text-[10px]">
                {uniqueDescriptions.map(({ description, color }) => (
                  <div key={description} className="flex items-center gap-1">
                    <div 
                      className="w-2 h-2 flex-shrink-0" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-muted-foreground">{description}</span>
                  </div>
                ))}
              </div>
            )}
            
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-muted/20">
                  <th className="px-1 md:px-2 py-1.5 md:py-2 text-center text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-1 md:px-2 py-1.5 md:py-2 text-left text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-1 md:px-2 py-1.5 md:py-2 text-center text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    GP
                  </th>
                  <th className="px-1 md:px-2 py-1.5 md:py-2 text-center text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    W
                  </th>
                  <th className="px-1 md:px-2 py-1.5 md:py-2 text-center text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    L
                  </th>
                  <th className="px-1 md:px-2 py-1.5 md:py-2 text-center text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    PF
                  </th>
                  <th className="px-1 md:px-2 py-1.5 md:py-2 text-center text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    PA
                  </th>
                  <th className="px-1 md:px-2 py-1.5 md:py-2 text-center text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    +/-
                  </th>
                  <th className="px-1 md:px-2 py-1.5 md:py-2 text-center text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupStandings.map((standing) => (
                  <BasketballStandingsRow
                    key={standing.id}
                    standing={standing}
                    descriptionColor={getColorForStanding(standing, allDescriptions)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}