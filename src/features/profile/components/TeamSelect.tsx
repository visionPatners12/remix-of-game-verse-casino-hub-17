import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TeamOption {
  value: string;
  label: string;
  league: string;
  colors: string;
  logo: string;
}

interface TeamSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  teams: TeamOption[];
}

export function TeamSelect({ value, onValueChange, teams }: TeamSelectProps) {
  const selectedTeam = teams.find(team => team.value === value);

  // Group teams by league
  const teamsByLeague = teams.reduce((acc, team) => {
    if (!acc[team.league]) acc[team.league] = [];
    acc[team.league].push(team);
    return acc;
  }, {} as Record<string, TeamOption[]>);

  if (selectedTeam) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Équipe favorite</label>
        <div className="relative">
          <div className={`p-4 rounded-lg bg-gradient-to-r ${selectedTeam.colors} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedTeam.logo}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedTeam.label}</p>
                  <p className="text-xs opacity-90">{selectedTeam.league}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onValueChange('')}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Équipe favorite</label>
      <div className="space-y-4">
        {Object.entries(teamsByLeague).map(([league, leagueTeams]) => (
          <div key={league} className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {league}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {leagueTeams.map((team) => (
                <Button
                  key={team.value}
                  variant="outline"
                  onClick={() => onValueChange(team.value)}
                  className="h-auto p-3 justify-start hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${team.colors} flex items-center justify-center text-xs font-bold text-white`}>
                      {team.logo}
                    </div>
                    <span className="text-sm">{team.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}