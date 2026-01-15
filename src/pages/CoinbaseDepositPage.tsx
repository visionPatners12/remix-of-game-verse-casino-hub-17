import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TokenUSDC, NetworkBase } from '@web3icons/react';
import { Shield, Loader2, AlertCircle, RefreshCw, ArrowLeft, Info } from 'lucide-react';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { useCdpSessionToken } from '@/features/deposit/hooks/useCdpSessionToken';
import { CoinbaseFundCard } from '@/features/deposit/components/CoinbaseFundCard';
import { CoinbaseProvider } from '@/features/deposit/providers/CoinbaseProvider';
import { Button } from '@/components/ui/button';

const CoinbaseDepositPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('deposit');
  const { address, isConnected } = useUnifiedWallet();
  const { sessionToken, isLoading, error, regenerate } = useCdpSessionToken(address);

  // Header consistant avec DepositFlow
  const renderHeader = () => (
    <div 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center h-14 px-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-lg pr-8">
          {t('methods.coinbase.buyTitle', 'Buy USDC')}
        </h1>
      </div>
    </div>
  );

  // Loading state premium
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {renderHeader()}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
                <TokenUSDC variant="branded" size={20} />
              </div>
            </div>
          </div>
          <p className="mt-6 text-muted-foreground text-center">
            {t('coinbase.generatingSession', 'Preparing your session...')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !isConnected || !sessionToken) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {renderHeader()}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {!isConnected 
              ? t('coinbase.walletRequired', 'Wallet Connection Required')
              : t('coinbase.sessionError', 'Session Error')
            }
          </h3>
          <p className="text-muted-foreground text-center text-sm mb-6 max-w-xs">
            {!isConnected 
              ? t('coinbase.connectWalletMessage', 'Please connect your wallet to continue.')
              : error || t('coinbase.tryAgain', 'Something went wrong. Please try again.')
            }
          </p>
          {isConnected && (
            <Button 
              onClick={regenerate}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('coinbase.retry', 'Try Again')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {renderHeader()}
      
      <div className="flex-1 px-4 py-6 pb-safe">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Asset Header Card */}
          <div className="bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <TokenUSDC variant="branded" size={40} />
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border/50">
                  <NetworkBase variant="branded" size={16} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">USDC</h2>
                <p className="text-sm text-muted-foreground">on Base Network</p>
              </div>
            </div>
          </div>

          {/* Official OnchainKit FundCard */}
          <CoinbaseProvider>
            <CoinbaseFundCard
              sessionToken={sessionToken}
              presetAmounts={['25', '50', '100']}
              onSuccess={() => {
                console.log('[CoinbaseDeposit] Success - Coinbase Pay opened');
              }}
              onError={(err) => {
                console.error('[CoinbaseDeposit] Error:', err);
              }}
            />
          </CoinbaseProvider>

          {/* Security Note */}
          <div className="p-4 rounded-2xl bg-muted/50 border border-border/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1 text-sm">
                  {t('coinbase.securedBy', 'Secured by Coinbase')}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t('coinbase.securityNote', 'Your payment information is encrypted and processed securely.')}
                </p>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-400">
                  {t('coinbase.instantDelivery', 'Instant Delivery')}
                </p>
                <p className="text-xs text-blue-300/80">
                  {t('coinbase.deliveryNote', 'USDC will be sent directly to your wallet on Base network.')}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoinbaseDepositPage;
