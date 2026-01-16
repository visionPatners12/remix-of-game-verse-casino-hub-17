import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TokenUSDC } from '@web3icons/react';
import { ArrowUpDown, CreditCard, Loader2, Building2, Check, Wallet, Banknote, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCdpPaymentMethods } from '@/features/deposit/hooks/useCdpPaymentMethods';
import { useApplePayOrder } from '@/features/deposit/hooks/useApplePayOrder';
import { markCoinbaseDepositPending } from '@/utils/coinbasePwa';
import { useAuth } from '@/features/auth';
import { useUserProfile } from '@/features/profile/hooks/useUserProfile';
import { useUnifiedWallet } from '@/features/wallet/hooks/core/useUnifiedWallet';
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
  sessionToken: string;
  presetAmounts?: string[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const CoinbaseFundCard: React.FC<CoinbaseFundCardProps> = ({
  sessionToken,
  presetAmounts = ['25', '50', '100'],
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation('deposit');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletAddress } = useUnifiedWallet();
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const { data: paymentData, isLoading: isLoadingMethods } = useCdpPaymentMethods();
  const { createOrder: createApplePayOrder, isLoading: isApplePayLoading } = useApplePayOrder();
  
  const [amount, setAmount] = useState('');
  const [inputType, setInputType] = useState<'fiat' | 'crypto'>('fiat');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CARD');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = value.split('.');
    const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;
    setAmount(sanitized);
    setSelectedPreset(null);
  };

  const handlePresetClick = (preset: string) => {
    setAmount(preset);
    setSelectedPreset(preset);
  };

  const toggleInputType = () => {
    setInputType(prev => prev === 'fiat' ? 'crypto' : 'fiat');
  };

  // Handle Apple Pay native flow
  const handleApplePaySubmit = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      onError?.('Please enter a valid amount');
      return;
    }

    // Check if phone number exists
    const phoneNumber = profile?.phone || profile?.phone_number;
    if (!phoneNumber) {
      toast.error(t('applePay.phoneRequired'), {
        description: t('applePay.phoneRequiredMessage'),
        action: {
          label: t('applePay.goToSettings'),
          onClick: () => navigate('/settings', { 
            state: { 
              returnTo: '/deposit/coinbase',
              requiredField: 'phone' 
            }
          }),
        },
      });
      return;
    }

    if (!walletAddress) {
      onError?.('Wallet not connected');
      return;
    }

    setIsSubmitting(true);

    try {
      const email = user?.email || profile?.email || '';
      const userId = user?.id || '';

      const orderResponse = await createApplePayOrder({
        destinationAddress: walletAddress,
        email,
        phoneNumber,
        paymentAmount: amount,
        partnerUserRef: userId.substring(0, 50),
      });

      if (!orderResponse || !orderResponse.paymentLink?.url) {
        throw new Error('Failed to create Apple Pay order');
      }

      console.log('[CoinbaseFundCard] Apple Pay order created:', orderResponse);

      // Mark deposit as pending for PWA return detection
      markCoinbaseDepositPending({
        amount,
        sessionToken,
        partnerUserRef: userId,
      });

      // Open Apple Pay payment link
      window.open(orderResponse.paymentLink.url, '_blank', 'noopener,noreferrer');
      
      onSuccess?.();
    } catch (err) {
      console.error('[CoinbaseFundCard] Apple Pay error:', err);
      onError?.(err instanceof Error ? err.message : 'Failed to process Apple Pay');
    } finally {
      setIsSubmitting(false);
    }
  }, [amount, profile, walletAddress, user, sessionToken, createApplePayOrder, navigate, t, onSuccess, onError]);

  // Handle standard Coinbase Pay flow
  const handleSubmit = useCallback(async () => {
    // If Apple Pay native is selected, use the special flow
    if (selectedPaymentMethod === 'APPLE_PAY_NATIVE') {
      return handleApplePaySubmit();
    }

    if (!amount || parseFloat(amount) <= 0) {
      onError?.('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user ID for tracking (partnerUserRef)
      const userId = user?.id || '';
      const fiatCurrency = paymentData?.currencies?.[0] || 'USD';

      // Construct Coinbase Pay URL with all parameters
      const baseUrl = 'https://pay.coinbase.com/buy/select-asset';
      const params = new URLSearchParams({
        sessionToken,
        defaultAsset: 'USDC',
        defaultNetwork: 'base',
        defaultPaymentMethod: selectedPaymentMethod,
        fiatCurrency,
        defaultExperience: 'buy',
      });

      // Add amount based on input type
      if (inputType === 'fiat') {
        params.set('presetFiatAmount', amount);
      } else {
        params.set('presetCryptoAmount', amount);
      }

      // Add partner user ref for Transaction Status API tracking
      if (userId) {
        params.set('partnerUserRef', userId.substring(0, 50)); // Max 50 chars
      }

      const coinbasePayUrl = `${baseUrl}?${params.toString()}`;
      
      console.log('[CoinbaseFundCard] Opening Coinbase Pay:', coinbasePayUrl);
      
      // Mark deposit as pending for PWA return detection
      markCoinbaseDepositPending({
        amount,
        sessionToken,
        partnerUserRef: userId,
      });
      
      // Open in new window/tab
      window.open(coinbasePayUrl, '_blank', 'noopener,noreferrer');
      
      onSuccess?.();
    } catch (err) {
      console.error('[CoinbaseFundCard] Error:', err);
      onError?.(err instanceof Error ? err.message : 'Failed to open Coinbase Pay');
    } finally {
      setIsSubmitting(false);
    }
  }, [amount, inputType, sessionToken, selectedPaymentMethod, paymentData, user, handleApplePaySubmit, onSuccess, onError]);

  const numericAmount = parseFloat(amount) || 0;
  const methods = paymentData?.methods || [];

  return (
    <div className="space-y-4">
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
            {/* Apple Pay Native Option - First */}
            <button
              onClick={() => setSelectedPaymentMethod('APPLE_PAY_NATIVE')}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                ${selectedPaymentMethod === 'APPLE_PAY_NATIVE'
                  ? 'bg-primary/10 border border-primary/50'
                  : 'bg-muted/50 border border-transparent hover:bg-muted'}
              `}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedPaymentMethod === 'APPLE_PAY_NATIVE' ? 'bg-primary/20 text-primary' : 'bg-background text-muted-foreground'
              }`}>
                <ApplePayIcon />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium text-sm ${
                  selectedPaymentMethod === 'APPLE_PAY_NATIVE' ? 'text-primary' : 'text-foreground'
                }`}>{t('applePay.native', 'Apple Pay Direct')}</p>
                <p className="text-xs text-muted-foreground">{t('applePay.description', 'Fast & secure checkout')}</p>
              </div>
              {selectedPaymentMethod === 'APPLE_PAY_NATIVE' && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>

            {/* Other payment methods */}
            {methods.map((method) => {
              const IconComponent = PAYMENT_METHOD_ICONS[method.id] || CreditCard;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
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

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || isLoadingMethods}
        className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            {t('coinbase.opening', 'Opening Coinbase...')}
          </>
        ) : (
          <>
            <TokenUSDC variant="branded" size={20} className="mr-2" />
            {t('coinbase.buyUsdc', 'Buy USDC')}
            {numericAmount > 0 && ` · $${numericAmount.toFixed(0)}`}
          </>
        )}
      </Button>
    </div>
  );
};
