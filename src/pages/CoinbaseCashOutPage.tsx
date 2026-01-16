import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { TokenUSDC } from '@web3icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { usePrivy } from '@privy-io/react-auth';
import { useCdpOfframpJwt } from '@/features/withdraw/hooks/useCdpOfframpJwt';
import { useCdpOfframpQuote } from '@/features/withdraw/hooks/useCdpOfframpQuote';
import { OfframpQuoteBreakdown } from '@/features/withdraw/components/OfframpQuoteBreakdown';
import { DEFAULT_CHAIN_NAME } from '@/config/chains';

const CoinbaseCashOutPage: React.FC = () => {
  const { t } = useTranslation('withdraw');
  const navigate = useNavigate();
  const { address } = useUnifiedWallet();
  const { user } = usePrivy();
  
  const { token: jwtToken, refresh: refreshJwt, isLoading: jwtLoading, error: jwtError } = useCdpOfframpJwt();
  const { quote, createQuote, isLoading: quoteLoading, error: quoteError } = useCdpOfframpQuote();
  
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get user country from profile or browser
  const getUserCountry = (): string => {
    // Try to get from browser language
    const lang = navigator.language || 'en-US';
    const country = lang.split('-')[1];
    return country || 'US';
  };

  // Preset amounts
  const presetAmounts = ['25', '50', '100', '250'];

  const handleCashOut = async () => {
    if (!amount || parseFloat(amount) <= 0 || !address) {
      return;
    }

    setIsProcessing(true);

    try {
      // Refresh JWT if needed
      const freshToken = await refreshJwt();
      if (!freshToken) {
        throw new Error('Failed to get authentication token');
      }

      const country = getUserCountry();
      
      // Create the offramp quote with all required params for offramp_url
      const result = await createQuote({
        jwtToken: freshToken,
        sellCurrency: 'USDC',
        sellNetwork: 'base',
        sellAmount: amount,
        cashoutCurrency: 'USD',
        paymentMethod: 'ACH_BANK_ACCOUNT',
        country: country,
        subdivision: country === 'US' ? 'CA' : undefined, // Default to California if US
        sourceAddress: address,
        redirectUrl: `${window.location.origin}/withdrawal/coinbase/callback`,
        partnerUserRef: user?.id || address,
      });

      if (result?.offramp_url) {
        // Open Coinbase Pay in new window
        window.open(result.offramp_url, '_blank', 'noopener,noreferrer');
      } else if (result) {
        // Quote received but no offramp_url - this shouldn't happen if all params are provided
        console.warn('[CoinbaseCashOutPage] Quote received but no offramp_url:', result);
      }
    } catch (error) {
      console.error('[CoinbaseCashOutPage] Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = jwtLoading || quoteLoading || isProcessing;
  const error = jwtError || quoteError;
  const isDisabled = isLoading || !amount || parseFloat(amount) <= 0 || !address;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobilePageHeader 
        title={t('cashout.title', 'Cash Out to USD')} 
        onBack={() => navigate('/withdrawal')}
      />

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Visual Flow: USDC → USD */}
        <div className="flex items-center justify-center gap-4 py-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[#2775CA]/10 flex items-center justify-center">
              <TokenUSDC variant="branded" className="w-9 h-9" />
            </div>
            <span className="text-sm font-medium">USDC</span>
            <span className="text-xs text-muted-foreground">{DEFAULT_CHAIN_NAME}</span>
          </div>
          
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-xl font-bold text-green-500">$</span>
            </div>
            <span className="text-sm font-medium">USD</span>
            <span className="text-xs text-muted-foreground">{t('cashout.bankAccount', 'Bank Account')}</span>
          </div>
        </div>

        {/* Amount Input */}
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('cashout.amountLabel', 'Amount to sell')}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-xl h-14 pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  USDC
                </span>
              </div>
            </div>

            {/* Preset Amounts */}
            <div className="flex gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setAmount(preset)}
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quote Breakdown */}
        {quote && <OfframpQuoteBreakdown quote={quote} isLoading={quoteLoading} />}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Powered by Coinbase */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{t('cashout.poweredBy', 'Powered by Coinbase')}</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6c4.64 0 8.4 3.76 8.4 8.4s-3.76 8.4-8.4 8.4-8.4-3.76-8.4-8.4 3.76-8.4 8.4-8.4zm-2.4 4.8v7.2h4.8c1.988 0 3.6-1.612 3.6-3.6s-1.612-3.6-3.6-3.6H9.6z"/>
          </svg>
        </div>

        {/* Cash Out Button */}
        <Button
          onClick={handleCashOut}
          disabled={isDisabled}
          className="w-full h-14 text-base font-semibold gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('cashout.processing', 'Processing...')}
            </>
          ) : (
            <>
              {t('cashout.cashOutButton', 'Cash Out')}
              <ExternalLink className="h-4 w-4" />
            </>
          )}
        </Button>

        {/* Note */}
        <p className="text-xs text-center text-muted-foreground">
          {t('cashout.note', "You'll be redirected to Coinbase to complete the transaction.")}
        </p>

        {/* Security Note */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {t('cashout.securityNote', "Your transaction is secured by Coinbase's institutional-grade security.")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoinbaseCashOutPage;
