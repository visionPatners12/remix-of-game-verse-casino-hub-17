import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ChainIcon } from '@/components/ui/chain-icon';
import { Shield } from 'lucide-react';

const CoinbaseDepositPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('deposit');

  return (
    <CoinbaseProvider>
      <div className="min-h-screen bg-background">
        <MobilePageHeader 
          title="Coinbase Pay" 
          rightContent={<ChainIcon chainId={8453} size={24} showName />}
        />

        {/* Content */}
        <div className="px-4 py-6">
          <div className="max-w-md mx-auto">
            {/* Network Badge */}
            <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-[#0052FF]/10 border border-[#0052FF]/20 rounded-xl">
              <ChainIcon chainId={8453} size={28} />
              <div className="text-center">
                <span className="text-sm font-semibold text-foreground">USDC</span>
                <span className="text-xs text-muted-foreground ml-1">on Base Network</span>
              </div>
            </div>
            
            <FundCard
              assetSymbol="USDC"
              country="US"
              currency="USD"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-center text-foreground">
                  {t('coinbase.title')}
                </h2>
              </div>
              
              <FundCardAmountInput />
              <FundCardAmountInputTypeSwitch />
              <FundCardPresetAmountInputList />
              
              <div className="my-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg">
                <p className="text-xs font-medium text-foreground text-center">
                  {t('coinbase.selectMethod')}
                </p>
              </div>
              
              <FundCardPaymentMethodDropdown />
              <FundCardSubmitButton />
              
              <div className="mt-12 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-sm">
                      {t('coinbase.securedBy')}
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
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