import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ExternalLink, Loader2, AlertCircle, ArrowLeft, Check, Building2, Wallet, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { usePrivy } from '@privy-io/react-auth';
import { useCdpOfframpQuote } from '@/features/withdraw/hooks/useCdpOfframpQuote';
import { OfframpQuoteBreakdown } from '@/features/withdraw/components/OfframpQuoteBreakdown';
import { useUserCountry } from '@/hooks/useUserCountry';
import { useEnsSubdomain } from '@/hooks/useEnsSubdomain';
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
  const { ensSubdomain } = useEnsSubdomain();
  const { user } = usePrivy();
  const { country } = useUserCountry();
  
  // Use ENS subdomain if available, fallback to wallet address
  const sourceAddress = ensSubdomain || address;
  
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
  
  const numericAmount = parseFloat(amount) || 0;

  const handleGetQuote = async () => {
    if (!amount || parseFloat(amount) <= 0 || !sourceAddress) {
      return;
    }

    setIsProcessing(true);

    try {
      console.log('[CoinbaseCashOutPage] Creating offramp quote...', {
        sourceAddress,
        usingEns: !!ensSubdomain
      });
      
      const result = await createQuote({
        sellCurrency: 'USDC',
        sellNetwork: 'base',
        sellAmount: amount,
        cashoutCurrency: 'USD',
        paymentMethod: paymentMethod,
        country: country,
        subdivision: country === 'US' ? 'CA' : undefined,
        sourceAddress: sourceAddress,
        redirectUrl: `${window.location.origin}/withdrawal/coinbase/callback`,
        partnerUserRef: user?.id || sourceAddress,
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
  const isDisabled = isLoading || !amount || parseFloat(amount) <= 0 || !sourceAddress;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobilePageHeader 
        title={t('cashout.title', 'Cash Out to USD')} 
        onBack={() => step === 'confirm' ? handleBack() : navigate('/withdrawal')}
      />

      <div className="flex-1 px-4 py-6 space-y-5">
        {/* STEP 1: Amount Input */}
        {step === 'input' && (
          <>
            {/* Amount Input Card - Modern Style */}
            <div className="bg-card rounded-2xl p-5 border border-border/50">
              <label className="text-sm font-medium text-muted-foreground mb-4 block">
                {t('cashout.amountLabel', 'Amount to sell')}
              </label>
              
              <div className="flex items-center justify-center gap-2 py-4">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  className="text-4xl font-bold text-foreground bg-transparent border-none outline-none text-right w-full max-w-[160px] placeholder:text-muted-foreground/50"
                />
                <span className="text-2xl font-semibold text-muted-foreground">USDC</span>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                ≈ ${numericAmount.toFixed(2)} USD
              </p>
            </div>

            {/* Preset Amounts - Grid */}
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={cn(
                    "py-3 px-2 rounded-xl font-semibold text-sm transition-all duration-200",
                    amount === preset
                      ? "bg-primary/15 border-primary/50 text-primary border"
                      : "bg-muted border border-border/50 text-foreground hover:bg-primary/10"
                  )}
                >
                  ${preset}
                </button>
              ))}
            </div>

            {/* Payment Method Selector - Modern */}
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                {t('cashout.paymentMethod', 'Where to receive')}
              </label>
              
              <div className="space-y-2">
                {paymentMethods.filter(m => m.available).map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                        isSelected
                          ? "bg-primary/10 border border-primary/50"
                          : "bg-muted/50 border border-transparent hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-primary/20 text-primary" : "bg-background text-muted-foreground"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={cn(
                          "font-medium text-sm",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {t(method.labelKey, method.id)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t(method.descKey, '')}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Get Quote Button - Gradient */}
            <Button
              onClick={handleGetQuote}
              disabled={isDisabled}
              className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {t('cashout.gettingQuote', 'Getting Quote...')}
                </>
              ) : (
                <>
                  <span className="text-lg font-bold text-green-400 mr-1">$</span>
                  {t('cashout.getQuote', 'Get Quote')}
                  {numericAmount > 0 && (
                    <span className="ml-1 opacity-80">· {numericAmount.toFixed(0)} USDC</span>
                  )}
                </>
              )}
            </Button>

            {/* Powered by Coinbase */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
              <span>{t('cashout.poweredBy', 'Powered by')}</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6c4.64 0 8.4 3.76 8.4 8.4s-3.76 8.4-8.4 8.4-8.4-3.76-8.4-8.4 3.76-8.4 8.4-8.4zm-2.4 4.8v7.2h4.8c1.988 0 3.6-1.612 3.6-3.6s-1.612-3.6-3.6-3.6H9.6z"/>
              </svg>
              <span className="font-medium">Coinbase</span>
            </div>
          </>
        )}

        {/* STEP 2: Confirm Quote */}
        {step === 'confirm' && quote && (
          <>
            {/* Summary Card */}
            <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('cashout.selling', 'Selling')}</span>
                <span className="text-xl font-bold">{amount} USDC</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('cashout.via', 'Via')}</span>
                <span className="font-medium">{getFlowSubtitle()}</span>
              </div>

              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('cashout.youWillReceive', 'You will receive')}</span>
                  <span className="text-2xl font-bold text-green-500">
                    ${quote.cashout_total.value}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {getDestinationText()}
                </p>
              </div>
            </div>

            {/* Quote Breakdown */}
            <OfframpQuoteBreakdown quote={quote} />

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-14 rounded-2xl"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('cashout.back', 'Back')}
              </Button>
              <Button
                onClick={handleConfirmCashOut}
                disabled={!offrampUrl}
                className="flex-1 h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/20"
                size="lg"
              >
                {t('cashout.confirm', 'Confirm')}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Note */}
            <p className="text-xs text-center text-muted-foreground">
              {t('cashout.note', "You'll be redirected to Coinbase to complete the transaction.")}
            </p>
          </>
        )}

        {/* Security Note - Always visible */}
        <div className="bg-primary/5 rounded-2xl p-4 flex items-start gap-3 border border-primary/20">
          <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            {t('cashout.securityNote', "Your transaction is secured by Coinbase's institutional-grade security.")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoinbaseCashOutPage;
