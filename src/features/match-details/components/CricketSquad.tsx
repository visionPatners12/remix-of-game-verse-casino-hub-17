import React, { memo, useState } from 'react';
import { Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui';

interface CricketSquadProps {
  squad: Array<{
    team: { id: number; name: string; logo: string; abbreviation: string };
    players: Array<{
      name: string;
      battingStyles?: string[];
      bowlingStyles?: string[];
      roles?: string[];
    }>;
  }> | null;
  isLoading?: boolean;
}

const getRoleBadgeColor = (role: string): string => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('captain')) return 'bg-amber-500/20 text-amber-500';
  if (roleLower.includes('keeper') || roleLower.includes('wicket')) return 'bg-blue-500/20 text-blue-500';
  if (roleLower.includes('batsman') || roleLower.includes('batter')) return 'bg-emerald-500/20 text-emerald-500';
  if (roleLower.includes('bowler')) return 'bg-purple-500/20 text-purple-500';
  if (roleLower.includes('all-rounder') || roleLower.includes('allrounder')) return 'bg-orange-500/20 text-orange-500';
  return 'bg-muted text-muted-foreground';
};

export const CricketSquad = memo(function CricketSquad({ 
  squad, 
  isLoading 
}: CricketSquadProps) {
  const [activeTeam, setActiveTeam] = useState<string>('0');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!squad || squad.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No squad data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <h3 className="font-medium">Squad</h3>
      </div>

      <Tabs value={activeTeam} onValueChange={setActiveTeam}>
        <TabsList className="w-full bg-muted/30">
          {squad.map((teamData, idx) => (
            <TabsTrigger 
              key={idx} 
              value={String(idx)}
              className="flex-1 gap-2"
            >
              {teamData.team.logo && (
                <img src={teamData.team.logo} alt="" className="w-4 h-4 object-contain" />
              )}
              <span className="text-xs">
                {teamData.team.abbreviation || teamData.team.name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {squad.map((teamData, idx) => (
          <TabsContent key={idx} value={String(idx)} className="mt-4">
            <div className="grid gap-2">
              {teamData.players.map((player, pIdx) => (
                <div 
                  key={pIdx}
                  className="flex items-center justify-between px-3 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <span className="font-medium text-sm">{player.name}</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {player.roles?.map((role, rIdx) => (
                      <span 
                        key={rIdx}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getRoleBadgeColor(role)}`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
});
