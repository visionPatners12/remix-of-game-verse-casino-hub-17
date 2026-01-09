import React, { memo, useState } from 'react';
import { Users, ArrowRightLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui';

interface RugbyPlayer {
  name: string | null;
  shortName: string | null;
  countryName: string | null;
  birth: string | null;
  height: string | null;
  position: string; // Forward, Back, Full Back, Prop, Unknown
  shirtNumber: number | null;
}

interface RugbyTeamLineup {
  team: {
    id: number | null;
    name: string | null;
    logo: string | null;
  };
  initialLineup: RugbyPlayer[];
  substitutions: RugbyPlayer[];
}

export interface RugbyLineupsData {
  home: RugbyTeamLineup;
  away: RugbyTeamLineup;
}

interface RugbyLineupsSectionProps {
  boxScores: RugbyLineupsData | any[] | null;
  isLoading?: boolean;
}

const getPositionBadgeColor = (position: string): string => {
  const posLower = position.toLowerCase();
  if (posLower.includes('forward')) return 'bg-red-500/20 text-red-400';
  if (posLower.includes('back') && !posLower.includes('full')) return 'bg-blue-500/20 text-blue-400';
  if (posLower.includes('full back')) return 'bg-purple-500/20 text-purple-400';
  if (posLower.includes('prop')) return 'bg-orange-500/20 text-orange-400';
  return 'bg-muted text-muted-foreground';
};

const PlayerCard = memo(function PlayerCard({ player }: { player: RugbyPlayer }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-3">
        {/* Jersey Number */}
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
          {player.shirtNumber ?? '-'}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm">{player.name || player.shortName || 'Unknown'}</span>
          {player.countryName && (
            <span className="text-xs text-muted-foreground">{player.countryName}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {player.height && (
          <span className="text-xs text-muted-foreground">{player.height}</span>
        )}
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getPositionBadgeColor(player.position)}`}>
          {player.position}
        </span>
      </div>
    </div>
  );
});

const TeamLineup = memo(function TeamLineup({ 
  lineup, 
  teamName,
  teamLogo 
}: { 
  lineup: RugbyTeamLineup; 
  teamName?: string;
  teamLogo?: string;
}) {
  return (
    <div className="space-y-4">
      {/* Starting XV */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Starting XV</span>
          <span className="text-xs text-muted-foreground">({lineup.initialLineup.length})</span>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          {lineup.initialLineup.length > 0 ? (
            lineup.initialLineup.map((player, idx) => (
              <PlayerCard key={idx} player={player} />
            ))
          ) : (
            <div className="py-4 text-center text-muted-foreground text-sm">
              No lineup data
            </div>
          )}
        </div>
      </div>

      {/* Substitutes */}
      {lineup.substitutions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Substitutes</span>
            <span className="text-xs text-muted-foreground">({lineup.substitutions.length})</span>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            {lineup.substitutions.map((player, idx) => (
              <PlayerCard key={idx} player={player} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export const RugbyLineupsSection = memo(function RugbyLineupsSection({ 
  boxScores, 
  isLoading 
}: RugbyLineupsSectionProps) {
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Type guard: check if boxScores has home/away structure (Rugby) vs array (other sports)
  const isRugbyLineups = boxScores && !Array.isArray(boxScores) && 'home' in boxScores && 'away' in boxScores;
  
  if (!isRugbyLineups) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No lineup data available
      </div>
    );
  }

  const rugbyData = boxScores as RugbyLineupsData;
  const homeTeam = rugbyData.home;
  const awayTeam = rugbyData.away;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <h3 className="font-medium">Lineups</h3>
      </div>

      <Tabs value={activeTeam} onValueChange={(v) => setActiveTeam(v as 'home' | 'away')}>
        <TabsList className="w-full bg-muted/30">
          <TabsTrigger value="home" className="flex-1 gap-2">
            {homeTeam?.team?.logo && (
              <img src={homeTeam.team.logo} alt="" className="w-5 h-5 object-contain" />
            )}
            <span className="text-xs truncate">
              {homeTeam?.team?.name || 'Home'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="away" className="flex-1 gap-2">
            {awayTeam?.team?.logo && (
              <img src={awayTeam.team.logo} alt="" className="w-5 h-5 object-contain" />
            )}
            <span className="text-xs truncate">
              {awayTeam?.team?.name || 'Away'}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-4">
          {homeTeam && (
            <TeamLineup 
              lineup={homeTeam} 
              teamName={homeTeam.team?.name || 'Home'} 
              teamLogo={homeTeam.team?.logo || undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="away" className="mt-4">
          {awayTeam && (
            <TeamLineup 
              lineup={awayTeam} 
              teamName={awayTeam.team?.name || 'Away'} 
              teamLogo={awayTeam.team?.logo || undefined}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});
