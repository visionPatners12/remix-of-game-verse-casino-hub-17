import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TokenUSDC } from '@web3icons/react';
import { ArrowUpDown, CreditCard, Loader2, Building2, Check, Wallet, Banknote, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCdpPaymentMethods } from '@/features/deposit/hooks/useCdpPaymentMethods';
import { useCdpOnrampSession } from '@/features/deposit/hooks/useCdpOnrampSession';
import { QuoteBreakdown } from '@/features/deposit/components/QuoteBreakdown';
import { markCoinbaseDepositPending } from '@/utils/coinbasePwa';
import { useAuth } from '@/features/auth';
import { useUnifiedWallet } from '@/features/wallet/hooks/core/useUnifiedWallet';
import { useUserCountry } from '@/hooks/useUserCountry';
import { useEnsSubdomain } from '@/hooks/useEnsSubdomain';
import { toast } from 'sonner';

// Apple Pay icon component
const ApplePayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M17.72 8.2c-.1.08-1.94 1.12-1.94 3.42 0 2.66 2.34 3.6 2.4 3.62-.01.06-.37 1.28-1.23 2.52-.76 1.1-1.56 2.19-2.78 2.19s-1.52-.7-2.93-.7c-1.37 0-1.86.72-2.97.72s-1.88-1.01-2.78-2.25C4.4 15.89 3.5 13.1 3.5 10.44c0-4.24 2.76-6.49 5.47-6.49 1.44 0 2.65.95 3.55.95.87 0 2.22-1 3.86-1 .62 0 2.86.06 4.34 2.16zm-5.11-3.96c.55-.66.95-1.57.95-2.49 0-.13-.01-.26-.04-.36-.91.03-1.99.6-2.64 1.36-.52.59-1 1.51-1 2.43 0 .14.02.28.04.33.07.01.18.03.28.03.82 0 1.85-.54 2.41-1.3z"/>
  </svg>
);

// Icon mapping for payment methods
const PAYMENT_METHOD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CARD: CreditCard,
  APPLE_PAY: ApplePayIcon,
  ACH_BANK_ACCOUNT: Building2,
  FIAT_WALLET: Wallet,
  CRYPTO_ACCOUNT: Wallet,
  SEPA: Banknote,
};

interface CoinbaseFundCardProps {
  presetAmounts?: string[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type FlowStep = 'input' | 'confirm';

export const CoinbaseFundCard: React.FC<CoinbaseFundCardProps> = ({
  presetAmounts = ['25', '50', '100'],
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation('deposit');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletAddress } = useUnifiedWallet();
  const { ensSubdomain } = useEnsSubdomain();
  const { country } = useUserCountry();
  const { data: paymentData, isLoading: isLoadingMethods } = useCdpPaymentMethods();
  
  // Use ENS subdomain if available, fallback to wallet address
  const destinationAddress = ensSubdomain || walletAddress;
  
  // CDP Session hook (JWT is now handled server-side)
  const { quote, isLoading: isCreatingSession, error: sessionError, createSession, reset: resetSession } = useCdpOnrampSession();
  
  const [amount, setAmount] = useState('');
  const [inputType, setInputType] = useState<'fiat' | 'crypto'>('fiat');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CARD');
  
  // 2-step flow state
  const [step, setStep] = useState<FlowStep>('input');
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = value.split('.');
    const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;
    setAmount(sanitized);
    setSelectedPreset(null);
    // Reset session when amount changes
    resetSession();
    setStep('input');
    setOnrampUrl(null);
  };

  const handlePresetClick = (preset: string) => {
    setAmount(preset);
    setSelectedPreset(preset);
    // Reset session when amount changes
    resetSession();
    setStep('input');
    setOnrampUrl(null);
  };

  const toggleInputType = () => {
    setInputType(prev => prev === 'fiat' ? 'crypto' : 'fiat');
    resetSession();
    setStep('input');
    setOnrampUrl(null);
  };

  // Step 1: Get quote without redirecting
  const handleGetQuote = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      onError?.('Please enter a valid amount');
      return;
    }

    if (!destinationAddress) {
      onError?.('Wallet not connected');
      return;
    }

    try {
      const userId = user?.id || '';

      console.log('[CoinbaseFundCard] Creating onramp session via edge function...', {
        destinationAddress,
        usingEns: !!ensSubdomain
      });

      const response = await createSession({
        walletAddress: destinationAddress,
        paymentAmount: amount,
        paymentMethod: selectedPaymentMethod,
        country,
        partnerUserRef: userId.substring(0, 50),
      });

      if (!response) {
        throw new Error(sessionError || 'Failed to create session');
      }

      console.log('[CoinbaseFundCard] Session created, storing URL for confirmation');
      
      // Store URL and move to confirmation step
      setOnrampUrl(response.session.onrampUrl);
      setStep('confirm');

    } catch (err) {
      console.error('[CoinbaseFundCard] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get quote';
      onError?.(errorMessage);
      toast.error(errorMessage);
    }
  }, [amount, walletAddress, user, country, selectedPaymentMethod, createSession, sessionError, onError]);

  // Step 2: Confirm and open Coinbase Pay
  const handleConfirmPayment = useCallback(() => {
    if (!onrampUrl) {
      toast.error('Session expired, please try again');
      setStep('input');
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = user?.id || '';
      
      // Mark deposit as pending for PWA return detection
      markCoinbaseDepositPending({
        amount,
        sessionToken: 'edge-function-session',
        partnerUserRef: userId,
      });

      // Open Coinbase Pay URL
      window.open(onrampUrl, '_blank', 'noopener,noreferrer');

      onSuccess?.();
    } catch (err) {
      console.error('[CoinbaseFundCard] Error opening Coinbase:', err);
      toast.error('Failed to open Coinbase Pay');
    } finally {
      setIsSubmitting(false);
    }
  }, [onrampUrl, user, amount, onSuccess]);

  // Go back to input step
  const handleBack = useCallback(() => {
    setStep('input');
    setOnrampUrl(null);
    resetSession();
  }, [resetSession]);

  const numericAmount = parseFloat(amount) || 0;
  const methods = paymentData?.methods || [];
  const isLoading = isLoadingMethods;
  const selectedMethodName = methods.find(m => m.id === selectedPaymentMethod)?.name || selectedPaymentMethod;

  // Confirmation step UI
  if (step === 'confirm' && quote) {
    return (
      <div className="space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h3 className="text-lg font-semibold text-foreground">
            {t('coinbase.confirmPurchase', 'Confirm Purchase')}
          </h3>
        </div>

        {/* Transaction Summary */}
        <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('coinbase.amount', 'Amount')}</span>
            <span className="text-xl font-bold text-foreground">${numericAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('coinbase.paymentMethod', 'Payment Method')}</span>
            <span className="font-medium text-foreground">{selectedMethodName}</span>
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('coinbase.youWillReceive', 'You will receive')}</span>
              <div className="flex items-center gap-2">
                <TokenUSDC variant="branded" size={24} />
                <span className="text-xl font-bold text-primary">
                  {parseFloat(quote.purchaseAmount).toFixed(2)} USDC
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Quote Breakdown */}
        <QuoteBreakdown quote={quote} />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-14 rounded-2xl text-base font-semibold"
          >
            {t('common:buttons.back', 'Back')}
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={isSubmitting}
            className="flex-1 h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t('coinbase.opening', 'Opening Coinbase...')}
              </>
            ) : (
              t('coinbase.confirmAndPay', 'Confirm & Pay')
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Input step UI
  return (
    <div className="space-y-4">
      {/* Session Error */}
      {sessionError && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Session Error</p>
            <p className="text-xs text-destructive/80">{sessionError}</p>
          </div>
        </div>
      )}

      {/* Amount Input Card */}
      <div className="bg-card rounded-2xl p-5 border border-border/50">
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          {t('coinbase.enterAmount', 'Enter Amount')}
        </label>
        
        <div className="relative">
          <div className="flex items-center justify-center gap-2">
            {inputType === 'fiat' && (
              <span className="text-4xl font-bold text-foreground">$</span>
            )}
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              className="text-4xl font-bold text-foreground bg-transparent border-none outline-none text-center w-full max-w-[200px] placeholder:text-muted-foreground/50"
            />
            {inputType === 'crypto' && (
              <span className="text-2xl font-semibold text-muted-foreground">USDC</span>
            )}
          </div>
          
          {/* Approximate conversion */}
          <p className="text-center text-sm text-muted-foreground mt-2">
            {inputType === 'fiat' 
              ? `≈ ${numericAmount.toFixed(2)} USDC`
              : `≈ $${numericAmount.toFixed(2)} USD`
            }
          </p>
        </div>

        {/* Type Switch */}
        <div className="flex justify-center mt-4">
          <button
            onClick={toggleInputType}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm font-medium text-muted-foreground"
          >
            <ArrowUpDown className="h-4 w-4" />
            {inputType === 'fiat' ? 'Switch to USDC' : 'Switch to USD'}
          </button>
        </div>
      </div>

      {/* Preset Amounts */}
      <div className="grid grid-cols-4 gap-2">
        {presetAmounts.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={`
              py-3 px-2 rounded-xl font-semibold text-sm transition-all duration-200
              ${selectedPreset === preset
                ? 'bg-primary/15 border-primary/50 text-primary border'
                : 'bg-muted border border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/30'
              }
            `}
          >
            ${preset}
          </button>
        ))}
        <button
          onClick={() => handlePresetClick('250')}
          className={`
            py-3 px-2 rounded-xl font-semibold text-sm transition-all duration-200
            ${selectedPreset === '250'
              ? 'bg-primary/15 border-primary/50 text-primary border'
              : 'bg-muted border border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/30'
            }
          `}
        >
          $250
        </button>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-card rounded-2xl p-4 border border-border/50">
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          {t('coinbase.selectMethod', 'Payment Method')}
        </label>
        
        {isLoadingMethods ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : methods.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            {t('coinbase.noMethods', 'No payment methods available')}
          </p>
        ) : (
          <div className="space-y-2">
            {methods.map((method) => {
              const IconComponent = PAYMENT_METHOD_ICONS[method.id] || CreditCard;
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedPaymentMethod(method.id);
                    resetSession();
                  }}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                    ${selectedPaymentMethod === method.id
                      ? 'bg-primary/10 border border-primary/50'
                      : 'bg-muted/50 border border-transparent hover:bg-muted'}
                  `}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedPaymentMethod === method.id ? 'bg-primary/20 text-primary' : 'bg-background text-muted-foreground'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium text-sm ${
                      selectedPaymentMethod === method.id ? 'text-primary' : 'text-foreground'
                    }`}>{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading state for quote */}
      {isCreatingSession && <QuoteBreakdown quote={null} isLoading />}

      {/* Get Quote Button */}
      <Button
        onClick={handleGetQuote}
        disabled={isCreatingSession || !amount || parseFloat(amount) <= 0 || isLoading || !!sessionError}
        className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreatingSession ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            {t('coinbase.gettingQuote', 'Getting quote...')}
          </>
        ) : (
          <>
            <TokenUSDC variant="branded" size={20} className="mr-2" />
            {t('coinbase.getQuote', 'Get Quote')}
            {numericAmount > 0 && ` · $${numericAmount.toFixed(0)}`}
          </>
        )}
      </Button>
    </div>
  );
};
