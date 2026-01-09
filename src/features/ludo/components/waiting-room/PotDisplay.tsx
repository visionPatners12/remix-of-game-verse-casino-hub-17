import React from 'react';
import { Coins } from 'lucide-react';

interface PotDisplayProps {
  betAmount: number;
  confirmedPlayers: number;
  totalPlayers: number;
}

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
  const currentPot = betAmount * confirmedPlayers;
  const expectedPot = betAmount * totalPlayers;

  return (
    <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
      <Coins className="w-6 h-6 text-primary" />
      <div className="text-center">
        <p className="text-2xl font-bold">{currentPot} USDT</p>
        <p className="text-xs text-muted-foreground">
          Current pot • {expectedPot} USDT expected
        </p>
      </div>
    </div>
  );
};
