import React from 'react';
import { format } from 'date-fns';
import { Trophy, Users, DollarSign, Calendar, Gamepad2 } from 'lucide-react';
import { TournamentFormData, TOURNAMENT_CONFIGS, DEFAULT_PRIZE_DISTRIBUTION } from '../types';

interface TournamentSummaryProps {
  formData: TournamentFormData;
}

export const TournamentSummary = ({ formData }: TournamentSummaryProps) => {
  const config = TOURNAMENT_CONFIGS[formData.tournamentSize];
  const totalPool = formData.entryFee * formData.tournamentSize;
  const commissionAmount = totalPool * (formData.commissionRate / 100);
  const netPrizePool = totalPool - commissionAmount;
  const firstPrize = netPrizePool * (DEFAULT_PRIZE_DISTRIBUTION[0].percentage / 100);

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-5 border border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Résumé du tournoi</h3>
      </div>

      <div className="space-y-3">
        {/* Name */}
        <div className="flex items-start justify-between">
          <span className="text-muted-foreground text-sm">Nom</span>
          <span className="font-medium text-right max-w-[60%] truncate">
            {formData.name || 'Tournoi sans nom'}
          </span>
        </div>

        {/* Players */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Joueurs
          </span>
          <span className="font-medium">{formData.tournamentSize} joueurs</span>
        </div>

        {/* Format */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <Gamepad2 className="h-3.5 w-3.5" /> Format
          </span>
          <span className="font-medium">
            {config.totalMatches} matchs • {config.rounds} rounds
          </span>
        </div>

        {/* Entry Fee */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" /> Entrée
          </span>
          <span className="font-medium">
            {formData.entryFee === 0 ? 'Gratuit' : `${formData.entryFee.toFixed(2)} USDC`}
          </span>
        </div>

        {/* Prize Pool */}
        {formData.entryFee > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" /> Prize Pool
            </span>
            <div className="text-right">
              <span className="font-semibold text-primary">{netPrizePool.toFixed(2)} USDC</span>
              <p className="text-xs text-muted-foreground">
                🥇 {firstPrize.toFixed(2)} USDC
              </p>
            </div>
          </div>
        )}

        {/* Rounds */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Rounds</span>
          <span className="font-medium text-sm">
            {config.roundNames.join(' → ')}
          </span>
        </div>

        {/* Start Date */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Début
          </span>
          <span className="font-medium">
            {formData.startWhenFull 
              ? 'Quand le tournoi est complet'
              : formData.tournamentStart 
                ? format(formData.tournamentStart, "d MMM yyyy 'à' HH:mm")
                : 'Non défini'
            }
          </span>
        </div>

        {/* Structure visuelle */}
        <div className="pt-3 border-t border-border/30">
          <div className="text-xs text-muted-foreground mb-2">Structure</div>
          <div className="flex items-center gap-2 flex-wrap">
            {formData.tournamentSize === 16 ? (
              <>
                <span className="text-xs px-2 py-1 rounded-full bg-muted/30">
                  4 matchs Quarts
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                  Finale
                </span>
              </>
            ) : (
              <>
                <span className="text-xs px-2 py-1 rounded-full bg-muted/30">
                  16 matchs R1
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-xs px-2 py-1 rounded-full bg-muted/30">
                  4 Demis
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                  Finale
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
