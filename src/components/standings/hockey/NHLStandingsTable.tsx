import { useState, useMemo } from 'react';
import { HockeyStanding } from '@/types/standings/hockey';
import { NHLStandingsRow } from './NHLStandingsRow';
import { ConferenceFilter } from '@/components/standings/ConferenceFilter';

interface NHLStandingsTableProps {
  standings: HockeyStanding[];
}

export function NHLStandingsTable({ standings }: NHLStandingsTableProps) {
  const [selectedConference, setSelectedConference] = useState<string>('');

  const conferences = useMemo(() => {
    const uniqueConferences = [...new Set(standings
      .map(s => s.conference)
      .filter((c): c is string => !!c)
    )];
    return uniqueConferences.sort();
  }, [standings]);

  const filteredStandings = useMemo(() => {
    if (!selectedConference) {
      return standings.filter(s => s.conference === conferences[0]);
    }
    return standings.filter(s => s.conference === selectedConference);
  }, [standings, selectedConference, conferences]);

  const groupByStage = (conferenceStandings: HockeyStanding[]) => {
    return conferenceStandings.reduce((acc, standing) => {
      const stage = standing.stage || 'Regular Season';
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(standing);
      return acc;
    }, {} as Record<string, HockeyStanding[]>);
  };

  const sortStages = (stages: [string, HockeyStanding[]][]) => {
    return stages.sort(([stageA], [stageB]) => {
      if (stageA === 'Regular Season') return -1;
      if (stageB === 'Regular Season') return 1;
      return stageA.localeCompare(stageB);
    });
  };

  const groupByDivision = (stageStandings: HockeyStanding[]) => {
    return stageStandings.reduce((acc, standing) => {
      const division = standing.division || '_no_division';
      if (!acc[division]) {
        acc[division] = [];
      }
      acc[division].push(standing);
      return acc;
    }, {} as Record<string, HockeyStanding[]>);
  };

  const sortByPosition = (standings: HockeyStanding[]) => {
    return [...standings].sort((a, b) => (a.position || 999) - (b.position || 999));
  };

  if (conferences.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No standings available
      </div>
    );
  }

  const stages = sortStages(Object.entries(groupByStage(filteredStandings)));

  return (
    <div className="w-full space-y-4">
      <ConferenceFilter
        conferences={conferences}
        selectedConference={selectedConference || conferences[0]}
        onConferenceChange={setSelectedConference}
      />

      <div className="space-y-6 pb-8">
        {stages.map(([stage, stageStandings]) => {
          const divisionGroups = groupByDivision(stageStandings);
          const hasDivisions = Object.keys(divisionGroups).length > 1 || !divisionGroups['_no_division'];

          return (
            <div key={stage} className="space-y-4">
              <div className="bg-primary/10 px-3 md:px-4 py-2 md:py-3 border-l-4 border-primary">
                <h3 className="font-bold text-sm md:text-base text-foreground">
                  {stage}
                </h3>
              </div>

              <div className="overflow-x-auto pb-4">
                {hasDivisions ? (
                  Object.entries(divisionGroups).map(([division, divisionStandings]) => (
                    <div key={division} className="mb-6 last:mb-0">
                      {division !== '_no_division' && (
                        <div className="bg-muted/40 px-3 py-2 border-b border-border">
                          <h4 className="font-semibold text-sm text-foreground">{division}</h4>
                        </div>
                      )}
                      <table className="w-full border-collapse">
                        <thead className="bg-muted/30">
                          <tr className="border-b border-border">
                            <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">#</th>
                            <th className="px-1.5 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Team</th>
                            <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">GP</th>
                            <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">W</th>
                            <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">L</th>
                            <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">OTL</th>
                            <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">PTS</th>
                            <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">GF</th>
                            <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">GA</th>
                            <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">+/-</th>
                            <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">STRK</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortByPosition(divisionStandings).map((standing) => (
                            <NHLStandingsRow
                              key={standing.id}
                              standing={standing}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))
                ) : (
                  <table className="w-full border-collapse">
                    <thead className="bg-muted/30">
                      <tr className="border-b border-border">
                        <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">#</th>
                        <th className="px-1.5 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Team</th>
                        <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">GP</th>
                        <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">W</th>
                        <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">L</th>
                        <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">OTL</th>
                        <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">PTS</th>
                        <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">GF</th>
                        <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">GA</th>
                        <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">+/-</th>
                        <th className="px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">STRK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortByPosition(stageStandings).map((standing) => (
                        <NHLStandingsRow
                          key={standing.id}
                          standing={standing}
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
    </div>
  );
}
