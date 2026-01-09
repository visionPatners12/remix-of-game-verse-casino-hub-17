import React, { memo } from "react";
import type { Game } from '@azuro-org/toolkit';
import { TennisScoreBoard } from "./TennisScoreBoard";
import { SoccerScoreBoard } from "./SoccerScoreBoard";
import { BasketballScoreBoard } from "./BasketballScoreBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui";
import { Activity, Info } from "lucide-react";

interface ScoreBoardProps {
  game: Game;
}

export const ScoreBoard = memo(function ScoreBoard({ game }: ScoreBoardProps) {
  // Vérifier si le match est en live
  const isLive = game.state === "Live";

  // Ne pas afficher le scoreboard si le match n'est pas en live
  if (!isLive) {
    return null;
  }

  const sportSlug = game.sport?.slug;

  // Pour le tennis, ne pas afficher de scoreboard séparé - il est intégré dans le header
  if (sportSlug === 'tennis') {
    return null;
  }

  // Composant football spécialisé
  if (sportSlug === 'soccer' || sportSlug === 'football') {
    return <SoccerScoreBoard game={game} />;
  }

  // Composant basketball spécialisé
  if (sportSlug === 'basketball') {
    return <BasketballScoreBoard game={game} />;
  }

  // Fallback pour autres sports en live
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
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Score en direct non disponible pour ce sport</p>
          <p className="text-sm mt-1">Sport: {sportSlug || 'Inconnu'}</p>
        </div>
      </CardContent>
    </Card>
  );
});