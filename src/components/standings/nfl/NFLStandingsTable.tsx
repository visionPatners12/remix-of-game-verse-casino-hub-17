import { NFLStanding } from '@/types/standings/nfl';
import { NFLStandingsRow } from './NFLStandingsRow';
import { ConferenceFilter } from '../ConferenceFilter';
import { useState, useMemo } from 'react';

interface NFLStandingsTableProps {
  standings: NFLStanding[];
}

export function NFLStandingsTable({ standings }: NFLStandingsTableProps) {
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
  
  // Group by conference first
  const groupedByConference = filteredStandings.reduce((acc, standing) => {
    const conference = standing.conference || 'Other';
    if (!acc[conference]) {
      acc[conference] = [];
    }
    acc[conference].push(standing);
    return acc;
  }, {} as Record<string, NFLStanding[]>);

  // Group by stage within each conference
  const groupByStage = (conferenceStandings: NFLStanding[]) => {
    return conferenceStandings.reduce((acc, standing) => {
      const stage = standing.stage || 'Regular Season';
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(standing);
      return acc;
    }, {} as Record<string, NFLStanding[]>);
  };

  const groupByDivision = (stageStandings: NFLStanding[]) => {
    return stageStandings.reduce((acc, standing) => {
      const division = standing.division || 'No Division';
      if (!acc[division]) {
        acc[division] = [];
      }
      acc[division].push(standing);
      return acc;
    }, {} as Record<string, NFLStanding[]>);
  };

  return (
    <div className="w-full">
      {/* Conference Filter */}
      <ConferenceFilter
        conferences={conferences}
        selectedConference={selectedConference}
        onConferenceChange={setSelectedConference}
      />
      
      
      {Object.entries(groupedByConference).map(([conference, conferenceStandings]) => {
        const stageGroups = groupByStage(conferenceStandings);
        const stages = Object.entries(stageGroups).sort((a, b) => {
          // Sort: Regular Season first, then others
          if (a[0].includes('Regular')) return -1;
          if (b[0].includes('Regular')) return 1;
          return a[0].localeCompare(b[0]);
        });

        return (
          <div key={conference} className="space-y-6">
            {stages.map(([stage, stageStandings]) => {
              const divisionGroups = groupByDivision(stageStandings);
              const hasDivisions = Object.keys(divisionGroups).length > 1;

              return (
                <div key={stage}>
                  <div className="bg-primary/10 px-3 md:px-4 py-2 md:py-3 border-l-4 border-primary mb-2">
                    <h3 className="font-bold text-sm md:text-base text-foreground">
                      {stage}
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {hasDivisions ? (
                      Object.entries(divisionGroups).map(([division, divisionStandings]) => (
                        <div key={division}>
                          <div className="bg-muted/40 px-2 md:px-3 py-1.5 md:py-2 border-b border-border">
                            <h4 className="font-semibold text-[10px] md:text-xs text-muted-foreground uppercase">
                              {division}
                            </h4>
                          </div>
                          <table className="w-full">
                            <thead className="bg-muted/30">
                              <tr className="border-b border-border">
                                <th className="px-1 md:px-2 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                                  #
                                </th>
                                <th className="px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-left min-w-[90px] md:min-w-[180px]">
                                  Team
                                </th>
                                <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                                  W-L-T
                                </th>
                                <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                                  PCT
                                </th>
                                <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                                  +/-
                                </th>
                                <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                                  STRK
                                </th>
                                <th className="hidden md:table-cell px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                                  DIV
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {divisionStandings.map((standing) => (
                                <NFLStandingsRow
                                  key={standing.id}
                                  standing={standing}
                                  showDivision={false}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))
                    ) : (
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr className="border-b border-border">
                            <th className="px-1 md:px-2 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                              #
                            </th>
                            <th className="px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-left min-w-[90px] md:min-w-[180px]">
                              Team
                            </th>
                            <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                              W-L-T
                            </th>
                            <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                              PCT
                            </th>
                            <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                              +/-
                            </th>
                            <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                              STRK
                            </th>
                            <th className="hidden md:table-cell px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                              DIV
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {stageStandings.map((standing) => (
                            <NFLStandingsRow
                              key={standing.id}
                              standing={standing}
                              showDivision={false}
                            />
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
