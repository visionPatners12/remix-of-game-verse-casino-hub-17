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
import { CoinbaseProvider } from '@/features/deposit/providers/CoinbaseProvider';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { Shield } from 'lucide-react';
import coinbaseLogo from '@/assets/coinbase-logo.png';

const CoinbaseDepositPage = () => {
  const { t } = useTranslation('deposit');

  return (
    <CoinbaseProvider>
      <div className="min-h-screen bg-background">
        <MobilePageHeader title="Coinbase Pay" />

        {/* Content */}
        <div className="px-4 py-6">
          <div className="max-w-md mx-auto coinbase-theme">
            {/* Coinbase Header */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src={coinbaseLogo} 
                alt="Coinbase" 
                className="h-8 w-auto"
              />
              <h2 className="text-xl font-semibold text-foreground">
                {t('coinbase.title')}
              </h2>
            </div>

            {/* Fund Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <FundCard
                assetSymbol="USDT"
                country="US"
                currency="USD"
              >
                <div className="space-y-4">
                  <FundCardAmountInput />
                  <FundCardAmountInputTypeSwitch />
                  <FundCardPresetAmountInputList />
                  
                  <div className="py-3 px-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <p className="text-xs font-medium text-foreground text-center">
                      {t('coinbase.selectMethod')}
                    </p>
                  </div>
                  
                  <FundCardPaymentMethodDropdown />
                  <FundCardSubmitButton />
                </div>
              </FundCard>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary-foreground" />
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
          </div>
        </div>
      </div>
    </CoinbaseProvider>
  );
};

export default CoinbaseDepositPage;