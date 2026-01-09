import React, { useState } from 'react';
import { useWalletTokensThirdWeb } from '@/features/wallet/hooks/tokens/useWalletTokensThirdWeb';
import { TokenIcon } from '@web3icons/react/dynamic';
import { useTokenIcon } from '@/hooks/useTokenIcon';
import { ChainIcon, SUPPORTED_CHAINS } from '@/components/ui/chain-icon';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const MobileTokenIcon = ({ token }: { token: any }) => {
  const tokenConfig = useTokenIcon({
    symbol: token.symbol,
    network: token.network || 'polygon',
    address: token.contractAddress,
    fallbackSymbol: token.symbol
  });

  return (
    <TokenIcon 
      symbol={tokenConfig.symbol}
      variant="branded"
      size={32}
      className="rounded-full"
    />
  );
};

export const MobileTokensList = () => {
  const { tokensByChain, isLoading, isConnected } = useWalletTokensThirdWeb();
  const [openChains, setOpenChains] = useState<Record<number, boolean>>(() => {
    // Default: open chains that have tokens
    const initial: Record<number, boolean> = {};
    SUPPORTED_CHAINS.forEach(chain => {
      initial[chain.id] = true;
    });
    return initial;
  });

  if (!isConnected) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    if (num < 1) return num.toFixed(6).replace(/\.?0+$/, '');
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 }).replace(/\.?0+$/, '');
  };

  const toggleChain = (chainId: number) => {
    setOpenChains(prev => ({
      ...prev,
      [chainId]: !prev[chainId]
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-background">
        <div className="px-4 py-3">
          <h3 className="text-base font-semibold text-foreground">Assets</h3>
        </div>
        <div className="px-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-20 bg-muted rounded mb-2" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="text-right">
                <div className="h-4 w-16 bg-muted rounded mb-2" />
                <div className="h-3 w-12 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get chains that have tokens
  const chainsWithTokens = SUPPORTED_CHAINS.filter(chain => 
    tokensByChain[chain.id] && tokensByChain[chain.id].tokens.length > 0
  );

  if (chainsWithTokens.length === 0) {
    return (
      <div className="bg-background">
        <div className="px-4 py-3">
          <h3 className="text-base font-semibold text-foreground">Assets</h3>
        </div>
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">No tokens found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex-1">
      {/* Section Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Assets</h3>
        <span className="text-xs text-muted-foreground">
          {chainsWithTokens.length} chain{chainsWithTokens.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Chains with Tokens */}
      <div className="space-y-1">
        {chainsWithTokens.map(chain => {
          const chainData = tokensByChain[chain.id];
          const isOpen = openChains[chain.id];

          return (
            <Collapsible 
              key={chain.id} 
              open={isOpen}
              onOpenChange={() => toggleChain(chain.id)}
            >
              {/* Chain Header */}
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <ChainIcon chainId={chain.id} size={24} />
                    <span className="font-medium text-foreground">{chain.name}</span>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {chainData.tokens.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatCurrency(chainData.totalValue)}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>

              {/* Tokens List */}
              <CollapsibleContent>
                <div className="divide-y divide-border">
                  {chainData.tokens.map((token, index) => (
                    <div 
                      key={`${token.contractAddress}-${index}`} 
                      className="flex items-center justify-between px-4 py-3 pl-8 active:bg-muted/50 transition-colors"
                    >
                      {/* Left: Icon + Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <MobileTokenIcon token={token} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {token.symbol}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatBalance(token.balance)}
                          </p>
                        </div>
                      </div>

                      {/* Right: Value */}
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="font-medium text-foreground text-sm">
                          {formatCurrency(token.quote)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};
