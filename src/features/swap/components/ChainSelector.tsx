// Chain selector dropdown - Compact native style
import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SwapChain } from '../types';

interface ChainSelectorProps {
  chains: SwapChain[];
  selectedChainId: number;
  onSelect: (chainId: number) => void;
  isLoading?: boolean;
}

// Chain logo URLs
const CHAIN_LOGOS: Record<number, string> = {
  1: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg',
  137: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg',
  42161: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg',
  10: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/optimism.svg',
  8453: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg',
};

export function ChainSelector({
  chains,
  selectedChainId,
  onSelect,
  isLoading,
}: ChainSelectorProps) {
  const selectedChain = chains.find(c => c.id === selectedChainId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-sm"
          disabled={isLoading}
        >
          {selectedChain ? (
            <>
              <Avatar className="h-4 w-4">
                <AvatarImage src={CHAIN_LOGOS[selectedChain.id]} alt={selectedChain.name} />
                <AvatarFallback className="text-[6px] bg-primary/10">
                  {selectedChain.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">
                {selectedChain.name}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Chain</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-44">
        {chains.map(chain => (
          <DropdownMenuItem
            key={chain.id}
            onClick={() => onSelect(chain.id)}
            className={`flex items-center gap-2 ${
              chain.id === selectedChainId ? 'bg-primary/10' : ''
            }`}
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={CHAIN_LOGOS[chain.id]} alt={chain.name} />
              <AvatarFallback className="text-[8px] bg-primary/10">
                {chain.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{chain.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
