import React from 'react';
import { format } from 'date-fns';
import { Trophy, Users, DollarSign, Calendar, Dice6 } from 'lucide-react';
import { TournamentFormData, BRACKET_CONFIGS, DEFAULT_PRIZE_DISTRIBUTION } from '../types';

interface TournamentSummaryProps {
  formData: TournamentFormData;
}

export const TournamentSummary = ({ formData }: TournamentSummaryProps) => {
  const config = BRACKET_CONFIGS[formData.bracketSize];
  const totalPool = formData.entryFee * formData.bracketSize;
  const commissionAmount = totalPool * (formData.commissionRate / 100);
  const netPrizePool = totalPool - commissionAmount;
  const firstPrize = netPrizePool * (DEFAULT_PRIZE_DISTRIBUTION[0].percentage / 100);

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-5 border border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Tournament Summary</h3>
      </div>

      <div className="space-y-3">
        {/* Name */}
        <div className="flex items-start justify-between">
          <span className="text-muted-foreground text-sm">Name</span>
          <span className="font-medium text-right max-w-[60%] truncate">
            {formData.name || 'Untitled Tournament'}
          </span>
        </div>

        {/* Players */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Players
          </span>
          <span className="font-medium">{formData.bracketSize} max</span>
        </div>

        {/* Entry Fee */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" /> Entry
          </span>
          <span className="font-medium">
            {formData.entryFee === 0 ? 'Free' : `${formData.entryFee.toFixed(2)} USDC`}
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
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <Dice6 className="h-3.5 w-3.5" /> Rounds
          </span>
          <span className="font-medium">
            {config.rounds} ({config.roundNames.join(' → ')})
          </span>
        </div>

        {/* Start Date */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Start
          </span>
          <span className="font-medium">
            {formData.startWhenFull 
              ? 'When bracket is full'
              : formData.tournamentStart 
                ? format(formData.tournamentStart, "MMM d, yyyy 'at' HH:mm")
                : 'Not set'
            }
          </span>
        </div>

        {/* Settings badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
          {formData.extraTurnOnSix && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
              Extra turn on 6
            </span>
          )}
          {formData.betPerMatch > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground">
              ${formData.betPerMatch} side bets
            </span>
          )}
          <span className="text-xs px-2 py-1 rounded-full bg-muted/30 text-muted-foreground">
            Single elimination
          </span>
        </div>
      </div>
    </div>
  );
};
