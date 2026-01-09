import React, { memo } from "react";
import type { Game } from '@azuro-org/toolkit';
import { Card, CardContent, CardHeader, CardTitle } from "@/ui";
import { useLiveStats } from "@/features/sports";
import { Activity, Trophy, Target, Circle, Play, Hash, Crown, Loader2 } from "lucide-react";

interface TennisScoreBoardProps {
  game: Game;
  liveData?: any;
}

// Convertir les points tennis en format standard
const convertTennisPoints = (points: number): string => {
  switch (points) {
    case 0: return "0";
    case 1: return "15";
    case 2: return "30";
    case 3: return "40";
    case 4: return "Avantage";
    default: return points.toString();
  }
};

export const TennisScoreBoard = memo(function TennisScoreBoard({ game, liveData: propLiveData }: TennisScoreBoardProps) {
  const hookLiveStats = useLiveStats(game, 'tennis');
  const liveStats = propLiveData || hookLiveStats;

  // Ne pas afficher si les données ne sont pas disponibles
  if (!liveStats.isAvailable || liveStats.error) {
    return null;
  }

  if (liveStats.isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-4 w-4" />
            <span>Score en direct</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-6 text-muted-foreground">
            <Loader2 className="h-8 w-8 mx-auto mb-2 opacity-50 animate-spin" />
            <p>Chargement des statistiques en direct...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Safe access to participant names
  const playerA = game.participants?.[0]?.name || "Joueur A";
  const playerB = game.participants?.[1]?.name || "Joueur B";

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-4 w-4" />
          <span>Score en direct</span>
          {liveStats.currentSet && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              Set {liveStats.currentSet}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Headers */}
          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
            <div></div>
            <div className="text-center">Sets</div>
            <div className="text-center">Games</div>
            <div className="text-center">Points</div>
          </div>
          
          {/* Player A */}
          <div className="grid grid-cols-4 gap-2 items-center">
            <div className="flex items-center gap-2">
              {liveStats.servingTeam === 'home' && (
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              )}
              <span className="text-sm font-medium truncate">{playerA}</span>
            </div>
            <div className="text-center font-bold text-lg">
              {liveStats.setsWon?.home ?? 0}
            </div>
            <div className="text-center font-bold text-lg">
              {liveStats.currentSetScore?.home ?? 0}
            </div>
            <div className="text-center font-bold text-lg">
              {convertTennisPoints(liveStats.gamePoints?.home ?? 0)}
            </div>
          </div>
          
          {/* vs */}
          <div className="text-center text-sm font-semibold text-muted-foreground">vs</div>
          
          {/* Player B */}
          <div className="grid grid-cols-4 gap-2 items-center">
            <div className="flex items-center gap-2">
              {liveStats.servingTeam === 'away' && (
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              )}
              <span className="text-sm font-medium truncate">{playerB}</span>
            </div>
            <div className="text-center font-bold text-lg">
              {liveStats.setsWon?.away ?? 0}
            </div>
            <div className="text-center font-bold text-lg">
              {liveStats.currentSetScore?.away ?? 0}
            </div>
            <div className="text-center font-bold text-lg">
              {convertTennisPoints(liveStats.gamePoints?.away ?? 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});