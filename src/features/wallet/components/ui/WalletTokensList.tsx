import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Wifi, WifiOff, ChevronDown, ChevronRight } from 'lucide-react';
import { TokenIcon } from '@web3icons/react/dynamic';
import { useWalletTokensThirdWeb } from '../../hooks/tokens/useWalletTokensThirdWeb';
import { useTokenIcon } from '@/hooks/useTokenIcon';
import { ChainIcon, SUPPORTED_CHAINS } from '@/components/ui/chain-icon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const WalletTokenIcon = ({ token, size = 32 }: { token: any; size?: number }) => {
  const tokenConfig = useTokenIcon({
    symbol: token.symbol,
    network: token.network || 'ethereum',
    address: token.contractAddress,
    fallbackSymbol: token.symbol
  });

  return (
    <div className="relative">
      <TokenIcon 
        symbol={tokenConfig.symbol}
        variant="branded"
        size={size}
        className="rounded-full"
      />
      {token.type && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-muted border border-background flex items-center justify-center">
          <span className="text-[6px] font-bold text-muted-foreground">
            {token.type === 'native' ? 'N' : 'T'}
          </span>
        </div>
      )}
    </div>
  );
};

export const WalletTokensList = () => {
  const {
    tokensByChain,
    isLoading,
    error,
    isConnected,
    walletAddress
  } = useWalletTokensThirdWeb();

  const [openChains, setOpenChains] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    SUPPORTED_CHAINS.forEach(chain => {
      initial[chain.id] = true;
    });
    return initial;
  });

  const toggleChain = (chainId: number) => {
    setOpenChains(prev => ({
      ...prev,
      [chainId]: !prev[chainId]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (!isConnected || !walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-muted-foreground" />
            Wallet Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Connect your wallet to view tokens</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chainsWithTokens = SUPPORTED_CHAINS.filter(chain => 
    tokensByChain[chain.id] && tokensByChain[chain.id].tokens.length > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-primary" />
          Tokens
          {chainsWithTokens.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {chainsWithTokens.length} chain{chainsWithTokens.length > 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border-2 bg-gradient-to-r from-card/40 to-muted/20 backdrop-blur-sm">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : chainsWithTokens.length > 0 ? (
          <div className="space-y-3">
            {chainsWithTokens.map(chain => {
              const chainData = tokensByChain[chain.id];
              const isOpen = openChains[chain.id];

              return (
                <Collapsible 
                  key={chain.id} 
                  open={isOpen}
                  onOpenChange={() => toggleChain(chain.id)}
                  className="border rounded-xl overflow-hidden"
                >
                  {/* Chain Header */}
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <ChainIcon chainId={chain.id} size={28} />
                        <span className="font-semibold text-foreground">{chain.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {chainData.tokens.length} token{chainData.tokens.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">
                          {formatCurrency(chainData.totalValue)}
                        </span>
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Tokens List */}
                  <CollapsibleContent>
                    <div className="p-2 space-y-2">
                      {chainData.tokens.map((token, index) => (
                        <div 
                          key={`${token.contractAddress}-${index}`} 
                          className="group flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-card/60 to-muted/20 hover:from-muted/40 hover:to-muted/30 transition-all duration-300 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-background/80 to-muted/40 flex items-center justify-center border border-border/50">
                            <WalletTokenIcon token={token} size={24} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-semibold text-sm text-foreground truncate">{token.name}</h3>
                              {token.type && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {token.type}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{token.symbol}</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-sm text-foreground">{token.formattedBalance}</p>
                            <p className="text-xs text-muted-foreground">
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
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tokens found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
