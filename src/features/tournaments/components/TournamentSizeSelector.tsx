import React from 'react';
import { cn } from '@/lib/utils';
import { Users, Trophy } from 'lucide-react';
import { TOURNAMENT_CONFIGS, TournamentSize } from '../types';

interface TournamentSizeSelectorProps {
  value: TournamentSize;
  onChange: (size: TournamentSize) => void;
}

const SIZES: TournamentSize[] = [16, 64];

export const TournamentSizeSelector = ({ value, onChange }: TournamentSizeSelectorProps) => {
  const config = TOURNAMENT_CONFIGS[value];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Taille du tournoi</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SIZES.map((size) => {
          const isSelected = value === size;
          const sizeConfig = TOURNAMENT_CONFIGS[size];
          
          return (
            <button
              key={size}
              type="button"
              onClick={() => onChange(size)}
              className={cn(
                "relative flex flex-col items-center justify-center p-5 rounded-xl transition-all duration-200",
                "border-2",
                isSelected 
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                  : "border-border/30 bg-muted/20 hover:border-border/50 hover:bg-muted/30"
              )}
            >
              <span className={cn(
                "text-3xl font-bold",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {size}
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                joueurs
              </span>
              
              <div className="mt-3 text-xs text-muted-foreground text-center">
                <span className="font-medium text-foreground">{sizeConfig.totalMatches}</span> matchs
                <span className="mx-1">•</span>
                <span className="font-medium text-foreground">{sizeConfig.rounds}</span> rounds
              </div>
              
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="h-3.5 w-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Détail de la structure */}
      <div className="bg-muted/20 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Trophy className="h-4 w-4 text-primary" />
          <span>Structure du tournoi</span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            Chaque match réunit <span className="font-semibold text-foreground">4 joueurs</span> en Ludo.
            Le gagnant de chaque match avance au round suivant.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {config.roundNames.map((name, idx) => (
            <div 
              key={name}
              className={cn(
                "flex items-center gap-2 text-xs px-3 py-1.5 rounded-full",
                idx === config.roundNames.length - 1 
                  ? "bg-primary/20 text-primary font-medium"
                  : "bg-muted/30 text-muted-foreground"
              )}
            >
              <span className="font-medium">{idx + 1}.</span>
              <span>{name}</span>
              {idx < config.roundNames.length - 1 && (
                <span className="text-muted-foreground/50">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Visualisation de la structure */}
        <div className="pt-2 border-t border-border/20">
          {value === 16 ? (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>🎮 <strong>4 matchs</strong> de Quarts (4 joueurs chacun) → 4 gagnants</p>
              <p>🏆 <strong>1 Finale</strong> avec les 4 gagnants → Champion</p>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>🎮 <strong>16 matchs</strong> Premier tour (4 joueurs chacun) → 16 gagnants</p>
              <p>🎯 <strong>4 matchs</strong> Demi-finales → 4 gagnants</p>
              <p>🏆 <strong>1 Finale</strong> → Champion</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
