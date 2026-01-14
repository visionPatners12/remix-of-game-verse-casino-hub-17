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
import { Shield } from 'lucide-react';

const CoinbaseDepositPage = () => {
  const { t } = useTranslation('deposit');

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
              assetSymbol="USDC"
              country="US"
              currency="USD"
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