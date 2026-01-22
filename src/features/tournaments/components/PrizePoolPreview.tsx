import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Percent } from 'lucide-react';
import { PrizeDistribution, PrizeDistributionType, PRIZE_DISTRIBUTIONS, TournamentSize } from '../types';

interface PrizePoolPreviewProps {
  entryFee: number;
  tournamentSize: TournamentSize;
  commissionRate: number;
  distributionType: PrizeDistributionType;
}

const POSITION_ICONS = ['🥇', '🥈', '🥉', '4️⃣'];
const POSITION_COLORS = [
  'text-yellow-500',
  'text-slate-400', 
  'text-amber-600',
  'text-muted-foreground'
];

export const PrizePoolPreview = ({ 
  entryFee, 
  tournamentSize, 
  commissionRate,
  distributionType
}: PrizePoolPreviewProps) => {
  const totalPool = entryFee * tournamentSize;
  const commissionAmount = totalPool * (commissionRate / 100);
  const netPrizePool = totalPool - commissionAmount;

  const selectedDistribution = PRIZE_DISTRIBUTIONS[distributionType].distribution;
  const prizes: PrizeDistribution[] = selectedDistribution.map(p => ({
    ...p,
    amount: Number((netPrizePool * (p.percentage / 100)).toFixed(2))
  }));

  if (entryFee === 0) {
    return (
      <div className="bg-muted/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
          <Trophy className="h-4 w-4" />
          <span>Aperçu du Prize Pool</span>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Pas de prize pool pour les tournois gratuits</p>
          <p className="text-xs mt-1">Les joueurs jouent pour la gloire !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Trophy className="h-4 w-4" />
        <span>Aperçu du Prize Pool</span>
      </div>

      {/* Pool breakdown */}
      <div className="space-y-2 pb-3 border-b border-border/30">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pool total</span>
          <span className="font-medium">
            {totalPool.toFixed(2)} USDC 
            <span className="text-muted-foreground text-xs ml-1">
              ({tournamentSize} × ${entryFee})
            </span>
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Percent className="h-3 w-3" />
            Commission ({commissionRate}%)
          </span>
          <span className="text-destructive font-medium">
            -{commissionAmount.toFixed(2)} USDC
          </span>
        </div>
        <div className="flex justify-between text-base font-semibold pt-2 border-t border-border/20">
          <span>Prize Pool Net</span>
          <span className="text-primary">{netPrizePool.toFixed(2)} USDC</span>
        </div>
      </div>

      {/* Distribution */}
      <div className="space-y-2">
        {prizes.map((prize, idx) => (
          <div 
            key={prize.position}
            className={cn(
              "flex items-center justify-between py-2 px-3 rounded-lg",
              idx === 0 ? "bg-primary/10" : "bg-muted/20"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{POSITION_ICONS[idx]}</span>
              <span className={cn("font-medium", POSITION_COLORS[idx])}>
                {prize.position === 3 ? '3ème-4ème' : `${prize.position}${getOrdinalSuffix(prize.position)}`}
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold">{prize.amount.toFixed(2)} USDC</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({prize.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getOrdinalSuffix(n: number): string {
  if (n === 1) return 'er';
  return 'ème';
}
