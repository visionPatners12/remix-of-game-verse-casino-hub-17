import React from 'react';
import { cn } from '@/lib/utils';
import { WalletToken } from '@/features/wallet/types';
import { TokenIcon } from '@web3icons/react/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TokenQuickSelectProps {
  tokens: WalletToken[];
  selectedToken: WalletToken | null;
  onSelectToken: (token: WalletToken) => void;
  isLoading?: boolean;
  isConnected?: boolean;
}

export const TokenQuickSelect: React.FC<TokenQuickSelectProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
  isLoading,
  isConnected = true
}) => {
  const { t } = useTranslation('withdraw');

  if (!isConnected) {
    return (
      <div className="p-6 text-center rounded-xl bg-muted/30">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <Wallet className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          {t('token.connectWallet', 'Connect your wallet to see tokens')}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl bg-muted/30">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <Wallet className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          {t('token.noTokens', 'No tokens available')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {t('token.select', 'Select Token')}
      </label>
      
      <div className="space-y-2">
        {tokens.map((token) => (
          <button
            key={token.contractAddress || token.symbol}
            onClick={() => onSelectToken(token)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
              "active:scale-[0.98]",
              selectedToken?.contractAddress === token.contractAddress
                ? "bg-primary/10 border-2 border-primary"
                : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
            )}
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <TokenIcon
                symbol={token.symbol}
                className="h-6 w-6"
                variant="branded"
              />
            </div>
            
            <div className="flex-1 text-left">
              <div className="font-medium">{token.symbol}</div>
              <div className="text-sm text-muted-foreground">{token.name}</div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">{parseFloat(token.balance).toFixed(4)}</div>
              <div className="text-sm text-muted-foreground">${token.quote.toFixed(2)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TokenQuickSelect;
