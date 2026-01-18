import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, ExternalLink, Loader2, AlertCircle, ArrowLeft, Check, Building2, Wallet, Bitcoin } from 'lucide-react';
import { TokenUSDC } from '@web3icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { usePrivy } from '@privy-io/react-auth';
import { useCdpOfframpQuote } from '@/features/withdraw/hooks/useCdpOfframpQuote';
import { OfframpQuoteBreakdown } from '@/features/withdraw/components/OfframpQuoteBreakdown';
import { useUserCountry } from '@/hooks/useUserCountry';
import { DEFAULT_CHAIN_NAME } from '@/config/chains';
import { cn } from '@/lib/utils';

type FlowStep = 'input' | 'confirm';

interface PaymentMethodOption {
  id: string;
  labelKey: string;
  descKey: string;
  icon: React.ElementType;
  available: boolean;
}

const CoinbaseCashOutPage: React.FC = () => {
  const { t } = useTranslation('withdraw');
  const navigate = useNavigate();
  const { address } = useUnifiedWallet();
  const { user } = usePrivy();
  const { country } = useUserCountry();
  
  const { quote, createQuote, isLoading: quoteLoading, error: quoteError, reset } = useCdpOfframpQuote();
  
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<FlowStep>('input');
  const [offrampUrl, setOfframpUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('FIAT_WALLET');

  // Payment methods with country-based availability
  const paymentMethods: PaymentMethodOption[] = useMemo(() => [
    {
      id: 'FIAT_WALLET',
      labelKey: 'cashout.methods.fiatWallet',
      descKey: 'cashout.methods.fiatWalletDesc',
      icon: Wallet,
      available: true,
    },
    {
      id: 'ACH_BANK_ACCOUNT',
      labelKey: 'cashout.methods.bankAccount',
      descKey: 'cashout.methods.bankAccountDesc',
      icon: Building2,
      available: country === 'US',
    },
    {
      id: 'CRYPTO_ACCOUNT',
      labelKey: 'cashout.methods.cryptoAccount',
      descKey: 'cashout.methods.cryptoAccountDesc',
      icon: Bitcoin,
      available: true,
    },
  ], [country]);

  // Get destination text based on payment method
  const getDestinationText = () => {
    switch (paymentMethod) {
      case 'ACH_BANK_ACCOUNT':
        return t('cashout.toYourBank', 'to your bank account');
      case 'FIAT_WALLET':
        return t('cashout.toCoinbaseBalance', 'to your Coinbase balance');
      case 'CRYPTO_ACCOUNT':
        return t('cashout.toCoinbaseCrypto', 'to your Coinbase crypto account');
      default:
        return '';
    }
  };

  // Get subtitle for the visual flow
  const getFlowSubtitle = () => {
    const method = paymentMethods.find(m => m.id === paymentMethod);
    return method ? t(method.labelKey, method.id) : '';
  };

  // Preset amounts
  const presetAmounts = ['25', '50', '100', '250'];

  const handleGetQuote = async () => {
    if (!amount || parseFloat(amount) <= 0 || !address) {
      return;
    }

    setIsProcessing(true);

    try {
      
      const result = await createQuote({
        sellCurrency: 'USDC',
        sellNetwork: 'base',
        sellAmount: amount,
        cashoutCurrency: 'USD',
        paymentMethod: paymentMethod,
        country: country,
        subdivision: country === 'US' ? 'CA' : undefined,
        sourceAddress: address,
        redirectUrl: `${window.location.origin}/withdrawal/coinbase/callback`,
        partnerUserRef: user?.id || address,
      });

      if (result) {
        setOfframpUrl(result.offramp_url || null);
        setStep('confirm');
      }
    } catch (error) {
      console.error('[CoinbaseCashOutPage] Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCashOut = () => {
    if (offrampUrl) {
      window.open(offrampUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBack = () => {
    setStep('input');
    setOfframpUrl(null);
    reset();
  };

  const isLoading = quoteLoading || isProcessing;
  const error = quoteError;
  const isDisabled = isLoading || !amount || parseFloat(amount) <= 0 || !address;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobilePageHeader 
        title={t('cashout.title', 'Cash Out to USD')} 
        onBack={() => step === 'confirm' ? handleBack() : navigate('/withdrawal')}
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
            <span className="text-xs text-muted-foreground">{getFlowSubtitle()}</span>
          </div>
        </div>

        {/* STEP 1: Amount Input */}
        {step === 'input' && (
          <>
            {/* Amount Input Card */}
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

            {/* Payment Method Selector */}
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <label className="text-sm font-medium">
                  {t('cashout.paymentMethod', 'Where to receive')}
                </label>
                <div className="space-y-2">
                  {paymentMethods.filter(m => m.available).map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors",
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-border"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          paymentMethod === method.id ? "bg-primary/10" : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5",
                            paymentMethod === method.id ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{t(method.labelKey, method.id)}</p>
                          <p className="text-xs text-muted-foreground">{t(method.descKey, '')}</p>
                        </div>
                        {paymentMethod === method.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

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

            {/* Get Quote Button */}
            <Button
              onClick={handleGetQuote}
              disabled={isDisabled}
              className="w-full h-14 text-base font-semibold gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('cashout.gettingQuote', 'Getting Quote...')}
                </>
              ) : (
                t('cashout.getQuote', 'Get Quote')
              )}
            </Button>
          </>
        )}

        {/* STEP 2: Confirm Quote */}
        {step === 'confirm' && quote && (
          <>
            {/* Summary Card - What you'll receive */}
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t('cashout.youWillReceive', 'You will receive')}
                </p>
                <p className="text-4xl font-bold text-green-500">
                  ${quote.cashout_total.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getDestinationText()}
                </p>
              </CardContent>
            </Card>

            {/* Quote Breakdown */}
            <OfframpQuoteBreakdown quote={quote} />

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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-14"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('cashout.back', 'Back')}
              </Button>
              <Button
                onClick={handleConfirmCashOut}
                disabled={!offrampUrl}
                className="flex-1 h-14 text-base font-semibold gap-2"
                size="lg"
              >
                {t('cashout.confirmCashOut', 'Confirm & Cash Out')}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {/* Note */}
            <p className="text-xs text-center text-muted-foreground">
              {t('cashout.note', "You'll be redirected to Coinbase to complete the transaction.")}
            </p>
          </>
        )}

        {/* Security Note - Always visible */}
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
