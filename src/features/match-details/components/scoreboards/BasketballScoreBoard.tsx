import React, { memo } from "react";
import type { Game } from '@azuro-org/toolkit';
import { Card, CardContent, CardHeader, CardTitle } from "@/ui";
import { Clock, Activity } from "lucide-react";
import { useLiveStats } from "@/features/sports";

interface BasketballScoreBoardProps {
  game: Game;
  liveData?: any;
}

export const BasketballScoreBoard = memo(function BasketballScoreBoard({ game, liveData: propLiveData }: BasketballScoreBoardProps) {
  const hookLiveData = useLiveStats(game, 'basketball');
  const liveData = propLiveData || hookLiveData;


  // Ne pas afficher le composant si les données ne sont pas disponibles
  if (!liveData.isAvailable || liveData.error) {
    return null;
  }

  if (liveData.isLoading) {
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
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50 animate-spin" />
            <p>Chargement des statistiques en direct...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (liveData.error) {
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
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Statistiques en direct non disponibles</p>
            <p className="text-xs mt-1">{liveData.error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-4 w-4" />
          <span>Score en direct</span>
          {liveData.gameTime && (
            <span className="ml-auto text-sm font-normal text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {liveData.gameTime}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <div className="text-2xl font-bold">{liveData.basketballTotal?.home ?? 0}</div>
              <div className="text-sm text-muted-foreground">{game.participants?.[0]?.name}</div>
            </div>
            
            <div className="mx-4 text-lg font-semibold text-muted-foreground">-</div>
            
            <div className="flex-1">
              <div className="text-2xl font-bold">{liveData.basketballTotal?.away ?? 0}</div>
              <div className="text-sm text-muted-foreground">{game.participants?.[1]?.name}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});