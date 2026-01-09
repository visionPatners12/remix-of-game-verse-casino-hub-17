import React, { memo } from "react";
import type { Game } from '@azuro-org/toolkit';
import { Card, CardContent, CardHeader, CardTitle } from "@/ui";
import { Clock, Target } from "lucide-react";
import { useLiveStats } from "@/features/sports";

interface SoccerScoreBoardProps {
  game: Game;
}

export const SoccerScoreBoard = memo(function SoccerScoreBoard({ game }: SoccerScoreBoardProps) {
  const liveData = useLiveStats(game, 'soccer');

  // Ne pas afficher le composant si les données ne sont pas disponibles
  if (!liveData.isAvailable || liveData.error) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-4 w-4" />
          <span>Score en direct</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Temps de jeu en cours</span>
          </div>
          
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <div className="text-2xl font-bold">{liveData.soccerGoals?.home ?? 0}</div>
              <div className="text-sm text-muted-foreground">{game.participants?.[0]?.name}</div>
            </div>
            
            <div className="mx-4 text-lg font-semibold text-muted-foreground">-</div>
            
            <div className="flex-1">
              <div className="text-2xl font-bold">{liveData.soccerGoals?.away ?? 0}</div>
              <div className="text-sm text-muted-foreground">{game.participants?.[1]?.name}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});