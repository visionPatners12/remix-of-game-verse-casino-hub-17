
import React from 'react';
import { Button } from '@/ui';
import { ChevronDown } from 'lucide-react';
import { TokenIcon } from '@web3icons/react/dynamic';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cryptoOptions, type CryptoOption } from '@/features/deposit';
import { useTokenIcon } from '@/hooks/useTokenIcon';

interface CryptoSelectorProps {
  selectedCrypto: CryptoOption;
  onSelect: (crypto: CryptoOption) => void;
  variant?: 'dropdown' | 'buttons';
}

const CryptoTokenIcon = ({ crypto, size = 20 }: { crypto: CryptoOption; size?: number }) => {
  const tokenConfig = useTokenIcon({
    symbol: crypto.symbol,
    network: crypto.network,
    address: crypto.address
  });

  return (
    <div className="relative">
      <TokenIcon 
        symbol={tokenConfig.symbol}
        variant="branded"
        size={size}
        className="rounded-full"
      />
    </div>
  );
};

export const CryptoSelector = ({ selectedCrypto, onSelect, variant = 'dropdown' }: CryptoSelectorProps) => {
  if (variant === 'buttons') {
    return (
      <div className="grid grid-cols-1 gap-3">
        {cryptoOptions.map((crypto) => (
          <Button
            key={crypto.id}
            variant={selectedCrypto.id === crypto.id ? 'default' : 'outline'}
            onClick={() => onSelect(crypto)}
            className="justify-start h-16 px-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="flex items-center gap-4 w-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-sm flex items-center justify-center border border-border/50">
                <CryptoTokenIcon crypto={crypto} size={24} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-semibold text-sm">{crypto.name}</div>
                <div className="text-xs text-muted-foreground truncate">{crypto.network} Network</div>
              </div>
              <div className="text-xs text-muted-foreground">
                {crypto.symbol}
              </div>
            </div>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between h-16 px-4 rounded-2xl border-2 bg-gradient-to-br from-card/80 to-muted/20 backdrop-blur-sm hover:bg-gradient-to-br hover:from-muted/60 hover:to-muted/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-sm flex items-center justify-center border border-border/50">
              <CryptoTokenIcon crypto={selectedCrypto} size={24} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="font-semibold text-sm">{selectedCrypto.name}</div>
              <div className="text-xs text-muted-foreground">{selectedCrypto.symbol} • {selectedCrypto.network}</div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[280px] md:min-w-[360px] bg-background/95 backdrop-blur-xl border-2 border-border/40 shadow-2xl shadow-black/20 rounded-2xl p-2" sideOffset={8}>
        <div className="space-y-1">
          {cryptoOptions.map((crypto) => (
            <DropdownMenuItem
              key={crypto.id}
              onClick={() => onSelect(crypto)}
              className="flex items-center gap-4 p-3 cursor-pointer hover:bg-muted/60 rounded-xl transition-all duration-200 hover:scale-[1.01]"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-background/60 to-muted/30 backdrop-blur-sm flex items-center justify-center border border-border/30">
                <CryptoTokenIcon crypto={crypto} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{crypto.name}</div>
                <div className="text-xs text-muted-foreground">{crypto.symbol} • {crypto.network} Network</div>
              </div>
              {selectedCrypto.id === crypto.id && (
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
