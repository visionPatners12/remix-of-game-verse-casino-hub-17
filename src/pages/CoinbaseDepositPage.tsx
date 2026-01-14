import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FundCard,
  FundCardAmountInput,
  FundCardAmountInputTypeSwitch,
  FundCardPresetAmountInputList,
  FundCardPaymentMethodDropdown,
  FundCardSubmitButton,
} from '@coinbase/onchainkit/fund';
import { TokenUSDC, NetworkBase } from '@web3icons/react';
import { CoinbaseProvider } from '@/features/deposit/providers/CoinbaseProvider';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { Shield, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { useCdpSessionToken } from '@/features/deposit/hooks/useCdpSessionToken';
import { Button } from '@/components/ui/button';

const CoinbaseDepositPage = () => {
  const { t } = useTranslation('deposit');
  const { address, isConnected } = useUnifiedWallet();
  const { sessionToken, isLoading, error, regenerate } = useCdpSessionToken(address);

  // Loading state
  if (isLoading) {
    return (
      <CoinbaseProvider>
        <div className="min-h-screen bg-background">
          <MobilePageHeader 
            title="Coinbase Pay" 
            rightContent={
              <div className="flex items-center gap-1">
                <TokenUSDC variant="branded" size={20} />
                <NetworkBase variant="branded" size={20} />
              </div>
            }
          />
          <div className="flex flex-col items-center justify-center px-4 py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground text-center">
              {t('coinbase.generatingSession', 'Preparing your session...')}
            </p>
          </div>
        </div>
      </CoinbaseProvider>
    );
  }

  // Error state or not connected
  if (error || !isConnected || !sessionToken) {
    return (
      <CoinbaseProvider>
        <div className="min-h-screen bg-background">
          <MobilePageHeader 
            title="Coinbase Pay" 
            rightContent={
              <div className="flex items-center gap-1">
                <TokenUSDC variant="branded" size={20} />
                <NetworkBase variant="branded" size={20} />
              </div>
            }
          />
          <div className="flex flex-col items-center justify-center px-4 py-20">
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
      </CoinbaseProvider>
    );
  }

  return (
    <CoinbaseProvider>
      <div className="min-h-screen bg-background">
        <MobilePageHeader 
          title="Coinbase Pay" 
          rightContent={
            <div className="flex items-center gap-1">
              <TokenUSDC variant="branded" size={20} />
              <NetworkBase variant="branded" size={20} />
            </div>
          }
        />

        {/* Content */}
        <div className="px-4 py-6">
          <div className="max-w-md mx-auto">
            <FundCard
              sessionToken={sessionToken}
              assetSymbol="USDC"
              country="US"
              currency="USD"
              onError={(error) => {
                console.error('[Coinbase FundCard] Error:', error);
              }}
              onSuccess={(result) => {
                console.log('[Coinbase FundCard] Success:', result);
              }}
              onStatus={(status) => {
                console.log('[Coinbase FundCard] Status:', status);
              }}
            >
              {/* Header with icons */}
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <TokenUSDC variant="branded" size={32} />
                  <span className="text-muted-foreground">→</span>
                  <NetworkBase variant="branded" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {t('coinbase.title')}
                </h2>
              </div>
              
              <FundCardAmountInput />
              <FundCardAmountInputTypeSwitch />
              <FundCardPresetAmountInputList />
              
              <div className="my-4 p-3 bg-muted/50 border border-border/30 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground text-center">
                  {t('coinbase.selectMethod')}
                </p>
              </div>
              
              <FundCardPaymentMethodDropdown />
              <FundCardSubmitButton />
              
              <div className="mt-8 p-4 bg-muted/50 border border-border/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1 text-sm">
                      {t('coinbase.securedBy')}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {t('coinbase.securityNote')}
                    </p>
                  </div>
                </div>
              </div>
            </FundCard>
          </div>
        </div>
      </div>
    </CoinbaseProvider>
  );
};

export default CoinbaseDepositPage;
