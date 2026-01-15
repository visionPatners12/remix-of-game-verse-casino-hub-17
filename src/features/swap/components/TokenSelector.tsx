// Token selector component with search and balances - Native design
import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Search, X, ChevronDown, Wallet } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { SwapToken, SwapTokenWithBalance } from '../types';
import { POPULAR_TOKENS } from '../hooks/useLifiTokens';
import { formatTokenAmount, formatUSD } from '../utils/formatters';

// Destination tokens for "To" selector (stablecoins + popular)
const DESTINATION_TOKENS = ['USDT', 'USDC', 'USDC.e', 'DAI', 'WETH', 'ETH', 'WBTC', 'MATIC', 'WMATIC'];

interface TokenSelectorProps {
  mode: 'from' | 'to';
  tokens: SwapToken[];
  tokensWithBalance?: SwapTokenWithBalance[];
  selectedToken: SwapToken | null;
  onSelect: (token: SwapToken) => void;
  chainId: number;
  isLoading?: boolean;
  label?: string;
  // AA wallet info (kept for compatibility, not currently used)
  isAAWallet?: boolean;
  aaAddress?: string;
  signerAddress?: string;
}

export function TokenSelector({
  mode,
  tokens,
  tokensWithBalance = [],
  selectedToken,
  onSelect,
  chainId,
  isLoading,
  label = 'Select',
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // All chain tokens with balances merged in
  const chainTokens = useMemo(() => {
    const chainList = tokens.filter(t => t.chainId === chainId);
    const balanceMap = new Map(
      tokensWithBalance
        .filter(t => t.chainId === chainId)
        .map(t => [t.address.toLowerCase(), t])
    );
    
    // Merge balance info into tokens
    return chainList.map(t => ({
      ...t,
      balance: balanceMap.get(t.address.toLowerCase())?.balance,
      balanceUSD: balanceMap.get(t.address.toLowerCase())?.balanceUSD,
    }));
  }, [tokens, tokensWithBalance, chainId]);

  // Filter and sort tokens based on mode
  const baseTokens = useMemo(() => {
    // For "from" mode: ONLY show tokens with balance > 0
    if (mode === 'from') {
      const tokensWithPositiveBalance = chainTokens.filter(t => 
        t.balance && BigInt(t.balance) > 0n
      );
      
      // Sort by USD value descending
      return tokensWithPositiveBalance.sort((a, b) => {
        const aUsd = Number(a.balanceUSD || 0);
        const bUsd = Number(b.balanceUSD || 0);
        return bUsd - aUsd;
      });
    }
    
    // For "to" mode: show destination tokens, sorted by popularity
    const filtered = chainTokens.filter(t => DESTINATION_TOKENS.includes(t.symbol));
    
    return filtered.sort((a, b) => {
      // Tokens with balance come first
      const aHasBalance = a.balance && BigInt(a.balance) > 0n;
      const bHasBalance = b.balance && BigInt(b.balance) > 0n;
      if (aHasBalance && !bHasBalance) return -1;
      if (!aHasBalance && bHasBalance) return 1;
      
      // Then by popularity
      const aPopular = POPULAR_TOKENS.indexOf(a.symbol);
      const bPopular = POPULAR_TOKENS.indexOf(b.symbol);
      if (aPopular !== -1 && bPopular === -1) return -1;
      if (aPopular === -1 && bPopular !== -1) return 1;
      if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
      
      return a.symbol.localeCompare(b.symbol);
    });
  }, [mode, chainTokens]);

  // Apply search filter
  const filteredTokens = useMemo(() => {
    if (!search) return baseTokens;
    const searchLower = search.toLowerCase();
    return baseTokens.filter(
      t => t.symbol.toLowerCase().includes(searchLower) ||
           t.name.toLowerCase().includes(searchLower) ||
           t.address.toLowerCase().includes(searchLower)
    );
  }, [baseTokens, search]);

  // Get balance for a token (for display purposes)
  const getBalance = useCallback((token: SwapToken) => {
    return tokensWithBalance.find(
      t => t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === chainId
    );
  }, [tokensWithBalance, chainId]);

  const handleSelect = useCallback((token: SwapToken) => {
    onSelect(token);
    setOpen(false);
    setSearch('');
  }, [onSelect]);

  // Quick select tokens based on mode
  const quickSelectTokens = useMemo(() => {
    if (mode === 'from') {
      return baseTokens.slice(0, 6);
    } else {
      return POPULAR_TOKENS.slice(0, 6)
        .map(symbol => tokens.find(t => t.symbol === symbol && t.chainId === chainId))
        .filter(Boolean) as SwapToken[];
    }
  }, [mode, baseTokens, tokens, chainId]);

  // Row renderer for virtualized list
  const TokenRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const token = filteredTokens[index];
    if (!token) return null;
    
    const balance = getBalance(token);
    const isSelected = selectedToken?.address.toLowerCase() === token.address.toLowerCase();
    
    return (
      <button
        style={style}
        onClick={() => handleSelect(token)}
        className={`flex items-center gap-3 w-full px-3 rounded-xl transition-all ${
          isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
        }`}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={token.logoURI} alt={token.symbol} />
          <AvatarFallback className="text-xs bg-primary/10">
            {token.symbol.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-foreground">{token.symbol}</div>
          <div className="text-xs text-muted-foreground truncate">
            {token.name}
          </div>
        </div>
        
        {balance && (
          <div className="text-right shrink-0">
            <div className="font-medium text-foreground">
              {formatTokenAmount(balance.balance, token.decimals)}
            </div>
            {balance.balanceUSD && (
              <div className="text-xs text-muted-foreground">
                {formatUSD(balance.balanceUSD)}
              </div>
            )}
          </div>
        )}
      </button>
    );
  }, [filteredTokens, selectedToken, getBalance, handleSelect]);

  // Calculate list height
  const listHeight = Math.min(filteredTokens.length * 64, 400);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors min-w-[120px]"
          disabled={isLoading}
        >
          {selectedToken ? (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedToken.logoURI} alt={selectedToken.symbol} />
                <AvatarFallback className="text-xs bg-primary/10">
                  {selectedToken.symbol.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-lg text-foreground">{selectedToken.symbol}</span>
            </>
          ) : (
            <span className="text-muted-foreground font-medium">{label}</span>
          )}
          <ChevronDown className="h-5 w-5 text-muted-foreground ml-auto" />
        </button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle>{mode === 'from' ? 'Select Token to Swap' : 'Select Destination Token'}</SheetTitle>
        </SheetHeader>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 bg-muted/50 border-0"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick select tokens */}
        {!search && quickSelectTokens.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {quickSelectTokens.map(token => (
              <button
                key={`${token.chainId}-${token.address}`}
                onClick={() => handleSelect(token)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={token.logoURI} alt={token.symbol} />
                  <AvatarFallback className="text-[8px]">{token.symbol.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{token.symbol}</span>
              </button>
            ))}
          </div>
        )}

        {/* Token list */}
        <div className="flex-1">
          {isLoading ? (
            // Loading skeletons
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {mode === 'from' ? (
                <>
                  <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No tokens in your wallet</p>
                  <p className="text-sm">Deposit tokens to start swapping</p>
                </>
              ) : (
                <p>No tokens found</p>
              )}
            </div>
          ) : (
            <List
              height={listHeight}
              width="100%"
              itemCount={filteredTokens.length}
              itemSize={64}
              overscanCount={5}
            >
              {TokenRow}
            </List>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
