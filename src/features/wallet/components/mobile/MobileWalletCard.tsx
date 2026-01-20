import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui';
import { RefreshCw, ArrowDownLeft, ArrowUpRight, QrCode, Copy, Check } from 'lucide-react';
import { useWalletTokensThirdWeb } from '@/features/wallet/hooks/tokens/useWalletTokensThirdWeb';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const MobileWalletCard = () => {
  const { t } = useTranslation('wallet');
  const { totalValue, isLoading, refetch, isConnected, walletAddress } = useWalletTokensThirdWeb();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast({ title: t('clipboard.addressCopied'), description: t('clipboard.addressCopiedDesc') });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="px-4 pt-12 pb-6">
        <div className="text-center py-12 bg-muted/20 rounded-2xl border border-border/50">
          <div className="w-16 h-16 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
            <QrCode className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-medium text-foreground mb-2">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('balance.connect')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-4">
      {/* Main Card */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl border border-border/50 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {walletAddress && (
              <button 
                onClick={copyAddress}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-xs font-mono text-muted-foreground">
                  {truncateAddress(walletAddress)}
                </span>
                {copied ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8 w-8 p-0 rounded-full"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Balance Display */}
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{t('balance.total')}</p>
          {isLoading ? (
            <div className="h-10 w-36 bg-muted/50 animate-pulse rounded-lg mx-auto" />
          ) : (
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {formatCurrency(totalValue)}
            </h2>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/deposit', { state: { from: '/wallet' } })}
            className="flex flex-col items-center gap-1 h-auto py-3 bg-muted/50 hover:bg-muted border-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium">{t('actions.deposit')}</span>
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/withdrawal')}
            className="flex flex-col items-center gap-1 h-auto py-3 bg-muted/50 hover:bg-muted border-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium">{t('actions.send')}</span>
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/receive')}
            className="flex flex-col items-center gap-1 h-auto py-3 bg-muted/50 hover:bg-muted border-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium">{t('actions.receive')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
