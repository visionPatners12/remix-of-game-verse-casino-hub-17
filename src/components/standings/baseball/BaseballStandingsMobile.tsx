import { BaseballStanding } from '@/types/standings/baseball';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ConferenceFilter } from '../ConferenceFilter';

interface BaseballStandingsMobileProps {
  standings: BaseballStanding[];
}

export function BaseballStandingsMobile({ standings }: BaseballStandingsMobileProps) {
  const navigate = useNavigate();
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

    Object.keys(grouped).forEach(stageName => {
      const stageStandings = grouped[stageName];
      const sorted = [...stageStandings].sort((a, b) => b.wins - a.wins);
      sorted.forEach((standing, index) => {
        standing.position = index + 1;
      });
      grouped[stageName] = sorted;
    });

    return grouped;
  };

  const handleRowClick = (standing: BaseballStanding) => {
    if (standing.team.slug) {
      navigate(`/team/${standing.team.id}`);
    }
  };

  const getDiffColor = (diff: number): string => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <ConferenceFilter
        conferences={leagues}
        selectedConference={selectedLeague}
        onConferenceChange={setSelectedLeague}
      />


      {Object.entries(groupedByLeague).map(([leagueName, leagueStandings]) => {
        const stageGroups = groupByStage(leagueStandings);
        
        return (
          <div key={leagueName} className="space-y-4">
            {Object.entries(stageGroups).map(([stageName, stageStandings]) => (
              <div key={stageName}>
                <div className="bg-primary/10 px-3 py-2 border-l-4 border-primary">
                  <h3 className="font-bold text-sm text-foreground">{stageName}</h3>
                </div>
                
                <div className="border border-border overflow-hidden bg-card">
                  {/* Header */}
                  <div className="flex items-center gap-2 py-1.5 px-2 bg-muted/30 border-b border-border text-[10px] font-semibold sticky top-0 z-10">
                    <div className="w-6 text-center flex-shrink-0">Pos</div>
                    <div className="flex-1 min-w-0">Team</div>
                    <div className="w-12 text-center flex-shrink-0">W-L</div>
                    <div className="w-10 text-center flex-shrink-0">%</div>
                    <div className="w-8 text-center flex-shrink-0">GB</div>
                    <div className="w-10 text-center flex-shrink-0">Diff</div>
                    <div className="w-10 text-center flex-shrink-0">Streak</div>
                  </div>

                  {/* Data rows */}
                  <div className="divide-y divide-border">
                    {stageStandings.map((standing) => (
                      <div
                        key={standing.id}
                        onClick={() => handleRowClick(standing)}
                        className="flex items-center gap-2 py-2 px-2 hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        {/* Position */}
                        <div className="w-6 text-center flex-shrink-0 text-[11px] font-semibold text-muted-foreground">
                          {standing.position}
                        </div>

                        {/* Team */}
                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <img
                            src={standing.team.logo}
                            alt={standing.team.name}
                            className="w-5 h-5 object-contain flex-shrink-0"
                          />
                          <span className="text-[11px] font-medium truncate">{standing.team.name}</span>
                        </div>

                        {/* Wins-Losses */}
                        <div className="text-[11px] text-muted-foreground w-12 text-center flex-shrink-0">
                          {standing.wins}-{standing.losses}
                        </div>

                        {/* Win Percentage */}
                        <div className="text-[11px] font-semibold w-10 text-center flex-shrink-0">
                          {standing.winPct.toFixed(3)}
                        </div>

                        {/* Games Behind */}
                        <div className="text-[11px] text-muted-foreground w-8 text-center flex-shrink-0">
                          {standing.gamesBehind}
                        </div>

                        {/* Run Differential */}
                        <div className={`text-[11px] font-semibold w-10 text-center flex-shrink-0 ${getDiffColor(standing.runDifferential)}`}>
                          {standing.runDifferential > 0 ? '+' : ''}{standing.runDifferential}
                        </div>

                        {/* Streak */}
                        <div className="text-[11px] text-muted-foreground w-10 text-center flex-shrink-0">
                          {standing.streak}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
