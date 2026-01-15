import React from 'react';
import { Button } from '@/ui';
import { ChevronRight } from 'lucide-react';
import { TokenUSDC, NetworkBase, NetworkPolygon, NetworkEthereum, NetworkArbitrumOne, NetworkOptimism } from '@web3icons/react';

interface BalanceCardProps {
  totalBalance: string;
  usdcBalance: string | null;
  usdcChainId: number | null;
  isLoading?: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
  onBalanceClick?: () => void;
}

const getChainIcon = (chainId: number) => {
  switch (chainId) {
    case 137: return <NetworkPolygon variant="branded" size={16} />;
    case 1: return <NetworkEthereum variant="branded" size={16} />;
    case 8453: return <NetworkBase variant="branded" size={16} />;
    case 42161: return <NetworkArbitrumOne variant="branded" size={16} />;
    case 10: return <NetworkOptimism variant="branded" size={16} />;
    default: return <NetworkBase variant="branded" size={16} />;
  }
};

export const BalanceCard = ({ 
  totalBalance, 
  usdcBalance, 
  usdcChainId, 
  isLoading, 
  onDeposit, 
  onWithdraw, 
  onBalanceClick 
}: BalanceCardProps) => {
  return (
    <div className="px-4 py-3 bg-background">
      <div 
        className="cursor-pointer hover:bg-muted/30 active:bg-muted/40 p-2 -mx-2 rounded-md transition-all duration-200 ease-in-out active:scale-[0.98] hover:shadow-sm"
        onClick={onBalanceClick}
      >
        {/* Total Balance */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Total Balance</span>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <span className="text-xl font-bold">{totalBalance}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </>
            )}
          </div>
        </div>
        
        {/* USDC Balance with chain icon */}
        {!isLoading && usdcBalance && (
          <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <TokenUSDC variant="branded" size={20} />
                {usdcChainId && (
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    {getChainIcon(usdcChainId)}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">{usdcBalance} USDC</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3">
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
