import { BaseballStanding } from '@/types/standings/baseball';
import { BaseballStandingsRow } from './BaseballStandingsRow';
import { ConferenceFilter } from '../ConferenceFilter';
import { useMemo, useState } from 'react';

interface BaseballStandingsTableProps {
  standings: BaseballStanding[];
}

export function BaseballStandingsTable({ standings }: BaseballStandingsTableProps) {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  const leagues = useMemo(() => {
    const uniqueLeagues = [...new Set(standings.map(s => {
      const leagueName = s.group_name?.includes('American') ? 'American League' : 
                         s.group_name?.includes('National') ? 'National League' : 
                         s.group_name;
      return leagueName;
    }).filter(Boolean))];
    return uniqueLeagues.sort();
  }, [standings]);

  const filteredStandings = useMemo(() => {
    if (!selectedLeague) return standings;
    return standings.filter(s => {
      const leagueName = s.group_name?.includes('American') ? 'American League' : 
                         s.group_name?.includes('National') ? 'National League' : 
                         s.group_name;
      return leagueName === selectedLeague;
    });
  }, [standings, selectedLeague]);

  const groupedByLeague = useMemo(() => {
    return filteredStandings.reduce((acc, standing) => {
      const leagueName = standing.group_name?.includes('American') ? 'American League' : 
                         standing.group_name?.includes('National') ? 'National League' : 
                         standing.group_name || 'Other';
      if (!acc[leagueName]) {
        acc[leagueName] = [];
      }
      acc[leagueName].push(standing);
      return acc;
    }, {} as Record<string, BaseballStanding[]>);
  }, [filteredStandings]);

  const groupByStage = (leagueStandings: BaseballStanding[]) => {
    const grouped = leagueStandings.reduce((acc, standing) => {
      const stageName = standing.stage || standing.description || 'Regular Season';
      if (!acc[stageName]) {
        acc[stageName] = [];
      }
      acc[stageName].push(standing);
      return acc;
    }, {} as Record<string, BaseballStanding[]>);

    // Recalculate positions for each stage
    Object.keys(grouped).forEach(stageName => {
      const stageStandings = grouped[stageName];
      // Sort by wins (descending)
      const sorted = [...stageStandings].sort((a, b) => b.wins - a.wins);
      // Reassign positions starting from 1
      sorted.forEach((standing, index) => {
        standing.position = index + 1;
      });
      grouped[stageName] = sorted;
    });

    return grouped;
  };

  if (!standings || standings.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <ConferenceFilter
        conferences={leagues}
        selectedConference={selectedLeague}
        onConferenceChange={setSelectedLeague}
      />


      {Object.entries(groupedByLeague).map(([league, leagueStandings]) => {
        const stageGroups = groupByStage(leagueStandings);
        
        return (
          <div key={league} className="space-y-6">
            {Object.entries(stageGroups).map(([stageName, stageStandings]) => (
              <div key={stageName} className="mb-6">
                <div className="bg-primary/10 px-3 md:px-4 py-2 md:py-3 border-l-4 border-primary mb-2">
                  <h3 className="font-bold text-sm md:text-base text-foreground">
                    {stageName}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr className="border-b border-border">
                        <th className="px-1 md:px-2 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          Pos
                        </th>
                        <th className="px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-left min-w-[90px] md:min-w-[180px]">
                          Team
                        </th>
                        <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          V
                        </th>
                        <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          D
                        </th>
                        <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          %
                        </th>
                        <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          GB
                        </th>
                        <th className="hidden md:table-cell px-2 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          Dom.
                        </th>
                        <th className="hidden md:table-cell px-2 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          Ext.
                        </th>
                        <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          RS
                        </th>
                        <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          RA
                        </th>
                        <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          Diff
                        </th>
                        <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-muted-foreground text-center">
                          Streak
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stageStandings.map((standing) => (
                        <BaseballStandingsRow key={standing.id} standing={standing} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
