import React, { memo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui';
import { MatchStatusBanner } from './MatchStatusBanner';
import type { CricketInning } from '../hooks/useMatchData';

interface CricketScorecardProps {
  statistics: CricketInning[] | null;
  states?: { description?: string; report?: string } | null;
  isLoading?: boolean;
}

export const CricketScorecard = memo(function CricketScorecard({ 
  statistics,
  states,
  isLoading 
}: CricketScorecardProps) {
  const [activeInning, setActiveInning] = useState<string>('0');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!statistics || statistics.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scorecard data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Match Status */}
      <MatchStatusBanner description={states?.description} report={states?.report} />

      <Tabs value={activeInning} onValueChange={setActiveInning}>
        <TabsList className="w-full bg-muted/30">
          {statistics.map((inning, idx) => (
            <TabsTrigger 
              key={idx} 
              value={String(idx)}
              className="flex-1 gap-2"
            >
              {inning.team?.logo && (
                <img src={inning.team.logo} alt="" className="w-4 h-4 object-contain" />
              )}
              <span className="text-xs">
                {inning.team?.abbreviation || inning.team?.name || `Inning ${inning.inningNumber}`}
                {inning.inningNumber > 2 && ` (${Math.ceil(inning.inningNumber / 2)})`}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {statistics.map((inning, idx) => {
          // Filter out players who didn't bat (runs === null)
          const activeBatsmen = (inning.team?.inningBatsmen || []).filter(b => b.runs !== null);
          const bowlers = inning.team?.inningBowlers || [];
          const fallOfWickets = inning.team?.fallOfWickets || [];

          return (
            <TabsContent key={idx} value={String(idx)} className="mt-4 space-y-6">
              {/* Batsmen Table */}
              <div>
                <h4 className="text-sm font-medium mb-2">Batting</h4>
                {activeBatsmen.length > 0 ? (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Batsman</th>
                          <th className="text-center px-2 py-2 font-medium">R</th>
                          <th className="text-center px-2 py-2 font-medium">B</th>
                          <th className="text-center px-2 py-2 font-medium">4s</th>
                          <th className="text-center px-2 py-2 font-medium">6s</th>
                          <th className="text-center px-2 py-2 font-medium">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {activeBatsmen.map((batsman, bIdx) => (
                          <tr key={bIdx} className="hover:bg-muted/20">
                            <td className="px-3 py-2 font-medium">{batsman.player?.name}</td>
                            <td className="text-center px-2 py-2 font-semibold">{batsman.runs}</td>
                            <td className="text-center px-2 py-2 text-muted-foreground">{batsman.balls}</td>
                            <td className="text-center px-2 py-2">{batsman.fours}</td>
                            <td className="text-center px-2 py-2">{batsman.sixes}</td>
                            <td className="text-center px-2 py-2 text-muted-foreground">
                              {batsman.battingStrikeRate?.toFixed(1) ?? '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No batting data available</p>
                )}
              </div>

              {/* Bowlers Table */}
              <div>
                <h4 className="text-sm font-medium mb-2">Bowling</h4>
                {bowlers.length > 0 ? (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Bowler</th>
                          <th className="text-center px-2 py-2 font-medium">O</th>
                          <th className="text-center px-2 py-2 font-medium">M</th>
                          <th className="text-center px-2 py-2 font-medium">R</th>
                          <th className="text-center px-2 py-2 font-medium">W</th>
                          <th className="text-center px-2 py-2 font-medium">Econ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {bowlers.map((bowler, bwIdx) => (
                          <tr key={bwIdx} className="hover:bg-muted/20">
                            <td className="px-3 py-2 font-medium">{bowler.player?.name}</td>
                            <td className="text-center px-2 py-2">{bowler.overs}</td>
                            <td className="text-center px-2 py-2 text-muted-foreground">{bowler.maidens}</td>
                            <td className="text-center px-2 py-2">{bowler.concededRuns}</td>
                            <td className="text-center px-2 py-2 font-semibold">{bowler.wickets}</td>
                            <td className="text-center px-2 py-2 text-muted-foreground">
                              {bowler.economy?.toFixed(1) ?? '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No bowling data available</p>
                )}
              </div>

              {/* Fall of Wickets */}
              {fallOfWickets.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Fall of Wickets</h4>
                  <div className="flex flex-wrap gap-2">
                    {fallOfWickets.map((fow, fowIdx) => (
                      <div 
                        key={fowIdx}
                        className="px-2 py-1 bg-muted/30 rounded text-xs"
                      >
                        <span className="font-semibold">{fow.runs}-{fow.order + 1}</span>
                        <span className="text-muted-foreground ml-1">
                          ({fow.dismissalBatsman?.name || 'Unknown'}, {fow.overs} ov)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
});
