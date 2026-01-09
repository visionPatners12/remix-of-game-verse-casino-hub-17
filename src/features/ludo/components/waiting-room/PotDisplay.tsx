import React from 'react';
import { Coins } from 'lucide-react';
import { useCasinoCommission } from '@/hooks/useCasinoCommission';

interface PotDisplayProps {
  betAmount: number;
  confirmedPlayers: number;
  totalPlayers: number;
}

export const PotDisplay: React.FC<PotDisplayProps> = ({
  betAmount,
  confirmedPlayers,
  totalPlayers,
}) => {
  const { commissionDecimal, commissionPercent } = useCasinoCommission();
  
  const currentPot = betAmount * confirmedPlayers;
  const expectedPot = betAmount * totalPlayers;
  const netPot = expectedPot * (1 - commissionDecimal);

  return (
    <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
      <Coins className="w-6 h-6 text-primary" />
      <div className="text-center">
        <p className="text-2xl font-bold">{currentPot.toFixed(2)} USDT</p>
        <p className="text-xs text-muted-foreground">
          Current pot • {netPot.toFixed(2)} USDT net prize ({commissionPercent}% fee)
        </p>
      </div>
    </div>
  );
};
