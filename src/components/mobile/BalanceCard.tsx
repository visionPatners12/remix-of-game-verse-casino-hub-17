import React from 'react';
import { Button } from '@/ui';
import { ChevronRight } from 'lucide-react';
import { TokenUSDC, NetworkBase } from '@web3icons/react';

interface BalanceCardProps {
  balance: string;
  isLoading?: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
  onBalanceClick?: () => void;
}

export const BalanceCard = ({ balance, isLoading, onDeposit, onWithdraw, onBalanceClick }: BalanceCardProps) => {
  return (
    <div className="px-4 py-3 bg-background">
      <div 
        className="flex items-center justify-between mb-3 cursor-pointer hover:bg-muted/30 active:bg-muted/40 p-2 -mx-2 rounded-md transition-all duration-200 ease-in-out active:scale-[0.98] hover:shadow-sm"
        onClick={onBalanceClick}
      >
        <div className="flex items-center gap-2">
          <TokenUSDC variant="branded" size={20} />
          <span className="text-sm text-muted-foreground">USDC Balance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            {isLoading ? (
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            ) : (
              balance
            )}
          </span>
          {!isLoading && (
            <>
              <NetworkBase variant="branded" size={16} />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button 
          className="w-full bg-primary text-primary-foreground" 
          onClick={onDeposit}
        >
          Deposit
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onWithdraw}
        >
          Withdraw
        </Button>
      </div>
    </div>
  );
};
