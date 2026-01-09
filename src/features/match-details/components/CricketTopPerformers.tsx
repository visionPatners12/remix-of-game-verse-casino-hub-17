import React, { memo } from 'react';
import { Target, Flame } from 'lucide-react';

interface CricketTopPerformersProps {
  topPerformers: {
    batsmen: Array<{
      team: { id: string; name: string; logo: string; abbreviation: string };
      players: Array<{
        name: string;
        runs: number;
        average: number;
        innings: number;
        matches: number;
        strikeRate: number;
      }>;
    }>;
    bowlers: Array<{
      team: { id: string; name: string; logo: string; abbreviation: string };
      players: Array<{
        name: string;
        wickets: number;
        economy: number;
        average: number;
        balls: number;
        concededRuns: number;
      }>;
    }>;
  } | null;
  isLoading?: boolean;
}

export const CricketTopPerformers = memo(function CricketTopPerformers({ 
  topPerformers, 
  isLoading 
}: CricketTopPerformersProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!topPerformers) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No top performers data available
      </div>
    );
  }

  const { batsmen, bowlers } = topPerformers;

  return (
    <div className="space-y-6">
      {/* Best Batsmen */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-4 w-4 text-amber-500" />
          <h3 className="font-medium">Best Batsmen</h3>
        </div>
        <div className="space-y-3">
          {batsmen.map((teamData, idx) => (
            <div key={idx} className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                {teamData.team.logo && (
                  <img src={teamData.team.logo} alt="" className="w-5 h-5 object-contain" />
                )}
                <span className="text-sm font-medium">{teamData.team.name}</span>
              </div>
              <div className="space-y-2">
                {teamData.players.map((player, pIdx) => (
                  <div key={pIdx} className="flex items-center justify-between text-xs bg-muted/20 rounded px-2 py-1.5">
                    <span className="font-medium">{player.name}</span>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span><span className="font-semibold text-foreground">{player.runs}</span> runs</span>
                      <span>Avg {player.average?.toFixed(1)}</span>
                      <span>SR {player.strikeRate?.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Bowlers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-emerald-500" />
          <h3 className="font-medium">Best Bowlers</h3>
        </div>
        <div className="space-y-3">
          {bowlers.map((teamData, idx) => (
            <div key={idx} className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                {teamData.team.logo && (
                  <img src={teamData.team.logo} alt="" className="w-5 h-5 object-contain" />
                )}
                <span className="text-sm font-medium">{teamData.team.name}</span>
              </div>
              <div className="space-y-2">
                {teamData.players.map((player, pIdx) => (
                  <div key={pIdx} className="flex items-center justify-between text-xs bg-muted/20 rounded px-2 py-1.5">
                    <span className="font-medium">{player.name}</span>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span><span className="font-semibold text-foreground">{player.wickets}</span> wkts</span>
                      <span>Econ {player.economy?.toFixed(1)}</span>
                      <span>Avg {player.average?.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
