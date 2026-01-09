import React, { memo } from "react";

interface LiveScoreSectionProps {
  liveData: any;
}

// Composant spécialisé pour l'affichage VS du basketball
export const BasketballVSSection = memo(function BasketballVSSection({ liveData }: LiveScoreSectionProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] sm:text-xs font-medium text-red-500 animate-pulse whitespace-nowrap">
        • LIVE
      </div>
      <div className="flex items-center gap-2 text-sm sm:text-lg font-bold text-foreground">
        <span className="text-primary min-w-[2ch] text-center">{liveData.basketballTotal?.home ?? 0}</span>
        <span className="text-muted-foreground text-xs sm:text-sm">VS</span>
        <span className="text-secondary min-w-[2ch] text-center">{liveData.basketballTotal?.away ?? 0}</span>
      </div>
      {liveData.gameTime && (
        <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap mt-0.5">
          {liveData.gameTime}
        </div>
      )}
    </div>
  );
});

// Composant spécialisé pour l'affichage VS du football
export const FootballVSSection = memo(function FootballVSSection({ liveData }: LiveScoreSectionProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] sm:text-xs font-medium text-red-500 animate-pulse whitespace-nowrap">
        • LIVE
      </div>
      <div className="flex items-center gap-2 text-sm sm:text-lg font-bold text-foreground">
        <span className="text-primary min-w-[2ch] text-center">{liveData.soccerGoals?.home ?? 0}</span>
        <span className="text-muted-foreground text-xs sm:text-sm">VS</span>
        <span className="text-secondary min-w-[2ch] text-center">{liveData.soccerGoals?.away ?? 0}</span>
      </div>
      {liveData.gameTime && (
        <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap mt-0.5">
          {liveData.gameTime.match(/^\d+$/) ? `${liveData.gameTime}'` : liveData.gameTime}
        </div>
      )}
    </div>
  );
});

// Composant spécialisé pour l'affichage VS du tennis
export const TennisVSSection = memo(function TennisVSSection({ liveData }: LiveScoreSectionProps) {
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
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] sm:text-xs font-medium text-red-500 animate-pulse whitespace-nowrap">
        • LIVE
      </div>
      
      {/* Section des scores avec stats de part et d'autre */}
      <div className="flex items-center gap-2">
        {/* Stats équipe A (gauche) */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-6 h-5 bg-primary/90 text-primary-foreground text-xs font-bold rounded-sm flex items-center justify-center">
            {liveData.setsWon.home}
          </div>
          <div className="w-6 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-sm flex items-center justify-center">
            {liveData.currentSetScore.home}
          </div>
          <div className="w-6 h-5 bg-muted text-foreground text-xs font-bold rounded-sm flex items-center justify-center">
            {convertTennisPoints(liveData.gamePoints?.home || 0)}
          </div>
        </div>
        
        {/* VS central */}
        <div className="flex flex-col items-center">
          <div className="text-xs sm:text-sm font-bold text-foreground">VS</div>
          {liveData.currentSet && (
            <div className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded mt-1">
              Set {liveData.currentSet}
            </div>
          )}
        </div>
        
        {/* Stats équipe B (droite) */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-6 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-sm flex items-center justify-center">
            {liveData.setsWon.away}
          </div>
          <div className="w-6 h-5 bg-accent/60 text-muted-foreground text-xs font-bold rounded-sm flex items-center justify-center">
            {liveData.currentSetScore.away}
          </div>
          <div className="w-6 h-5 bg-muted/60 text-muted-foreground text-xs font-bold rounded-sm flex items-center justify-center">
            {convertTennisPoints(liveData.gamePoints?.away || 0)}
          </div>
        </div>
      </div>
    </div>
  );
});