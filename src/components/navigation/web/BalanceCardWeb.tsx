import React from 'react';
import { Button } from '@/ui';
import { SoonOverlay } from '@/ui';
import { TokenUSDC, NetworkBase } from '@web3icons/react';

interface BalanceCardWebProps {
  balance: string;
  onDeposit: () => void;
  onWithdraw: () => void;
}

export const BalanceCardWeb = ({ balance, onDeposit, onWithdraw }: BalanceCardWebProps) => {
  return (
    <div className="p-3 border border-border bg-gradient-to-br from-card/50 to-card/30 rounded-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <TokenUSDC variant="branded" size={16} />
          <span className="text-xs font-medium text-muted-foreground">USDC</span>
          <NetworkBase variant="branded" size={12} />
        </div>
        <span className="text-lg font-bold text-foreground">{balance}</span>
      </div>
      <div className="flex gap-2">
        <SoonOverlay enabled={true}>
          <Button 
            size="sm"
            className="flex-1 bg-primary hover:bg-primary-hover shadow-sm shadow-primary/20 transition-all duration-300" 
            onClick={() => {}}
            disabled
          >
            Deposit
          </Button>
        </SoonOverlay>
        <SoonOverlay enabled={true}>
          <Button 
            size="sm"
            variant="outline" 
            className="flex-1 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300" 
            onClick={() => {}}
            disabled
          >
            Withdraw
          </Button>
        </SoonOverlay>
      </div>
    </div>
  );
};