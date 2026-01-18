import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, AlertCircle, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PinVerification } from '@/features/security';
import { useWithdraw } from '../hooks/useWithdraw';
import { usePinManagement } from '@/features/security';
import { useRecentRecipients } from '../hooks/useRecentRecipients';
import { logger } from '@/utils/logger';
import { isAddress } from 'viem';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useWalletTokensThirdWeb } from '@/features/wallet/hooks/tokens/useWalletTokensThirdWeb';
import { useTranslation } from 'react-i18next';

// Import new components
import { SendModeSelector, SendMode } from './SendModeSelector';
import { UserSearchSend } from './UserSearchSend';
import { TokenQuickSelect } from './TokenQuickSelect';
import { AmountInputCard } from './AmountInputCard';
import { DestinationCard } from './DestinationCard';
import { TransactionSummaryCard } from './TransactionSummaryCard';
import { SearchedUser } from '../hooks/useUserWalletLookup';

type WithdrawStep = 'mode' | 'user-search' | 'token' | 'details' | 'confirm';

const WithdrawFlow = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('withdraw');
  const {
    selectedToken,
    setSelectedToken,
    amount,
    cryptoAddress,
    selectedCrypto,
    isSubmitting,
    txHash,
    address,
    setAmount,
    setCryptoAddress,
    executeBlockchainWithdraw,
  } = useWithdraw();

  // Fetch wallet tokens
  const { tokens, isLoading: isLoadingTokens, isConnected } = useWalletTokensThirdWeb();

  const { pinStatus, verifyPin } = usePinManagement();
  const { recipients, addRecipient } = useRecentRecipients();

  // Flow state
  const [currentStep, setCurrentStep] = useState<WithdrawStep>('mode');
  const [sendMode, setSendMode] = useState<SendMode | null>(null);
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);

  // PIN check on load
  useEffect(() => {
    if (pinStatus && (!pinStatus.hasPin || !pinStatus.isEnabled)) {
      toast.error(t('errors.pinRequired', 'A PIN code is required for withdrawals'));
      setTimeout(() => navigate('/settings/pin?from=withdraw'), 2000);
    }
  }, [pinStatus, navigate, t]);

  // Handlers
  const handleModeSelect = (mode: SendMode) => {
    setSendMode(mode);
    if (mode === 'user') {
      setCurrentStep('user-search');
    } else if (mode === 'cashout') {
      navigate('/withdrawal/coinbase-cashout');
    } else {
      setCurrentStep('token');
    }
  };

  const handleUserSelect = (user: SearchedUser) => {
    setSelectedUser(user);
    if (user.wallet_address) {
      setCryptoAddress(user.wallet_address);
    }
    setCurrentStep('token');
  };

  const handleTokenSelect = (token: typeof selectedToken) => {
    setSelectedToken(token);
    setCurrentStep('details');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'mode':
        navigate('/wallet', { replace: true });
        break;
      case 'user-search':
        setCurrentStep('mode');
        setSendMode(null);
        break;
      case 'token':
        if (sendMode === 'user') {
          setCurrentStep('user-search');
        } else {
          setCurrentStep('mode');
          setSendMode(null);
        }
        break;
      case 'details':
        setCurrentStep('token');
        break;
      case 'confirm':
        setCurrentStep('details');
        break;
    }
  };

  const handleProceedToConfirm = () => {
    if (!canProceed) return;
    setCurrentStep('confirm');
  };

  const handlePinVerification = async (pin: string) => {
    try {
      const isValid = await verifyPin(pin);
      if (isValid) {
        setIsPinVerified(true);
        setShowPinVerification(false);
        toast.success(t('pinVerified', 'PIN verified, processing...'));
        
        // Execute transaction
        try {
          const hash = await executeBlockchainWithdraw();
          if (hash) {
            // Add to recent recipients
            addRecipient({
              type: selectedUser ? 'user' : 'address',
              address: cryptoAddress,
              label: selectedUser ? (selectedUser.first_name || selectedUser.username || undefined) : undefined,
              username: selectedUser?.username || undefined,
              avatar_url: selectedUser?.avatar_url || undefined,
              ens_subdomain: selectedUser?.ens_subdomain || undefined
            });
            setTimeout(() => navigate('/wallet'), 3000);
          }
        } catch (txError) {
          logger.error('Withdrawal error:', txError);
        }
        return true;
      } else {
        throw new Error('Incorrect PIN');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = () => {
    if (!isPinVerified) {
      setShowPinVerification(true);
      return;
    }
    executeBlockchainWithdraw();
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setCryptoAddress('');
    setCurrentStep('user-search');
  };

  const handleSelectRecent = (recipient: typeof recipients[0]) => {
    setCryptoAddress(recipient.address);
  };

  // Validation
  const canProceed = 
    amount && 
    parseFloat(amount) > 0 && 
    isAddress(cryptoAddress) && 
    address &&
    selectedToken &&
    parseFloat(amount) <= parseFloat(selectedToken.balance);

  const amountError = amount && selectedToken && parseFloat(amount) > parseFloat(selectedToken.balance)
    ? t('errors.insufficientBalance', 'Insufficient balance')
    : undefined;

  // Show PIN requirement error
  if (pinStatus && (!pinStatus.hasPin || !pinStatus.isEnabled)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">{t('errors.pinRequiredTitle', 'PIN Required')}</h2>
            <p className="text-muted-foreground">
              {t('errors.pinRequiredDesc', 'A PIN code is required for withdrawals. Redirecting to settings...')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* PIN Verification Modal */}
      {showPinVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl max-w-md w-full overflow-hidden">
            <PinVerification
              title={t('pinVerification.title', 'Verify PIN')}
              description={t('pinVerification.description', 'Enter your PIN to confirm the withdrawal')}
              onVerify={handlePinVerification}
              onCancel={() => setShowPinVerification(false)}
              maxAttempts={3}
              lockoutDuration={5 * 60 * 1000}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div 
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center h-14 px-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg pr-8">
            {t('title', 'Send')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {/* Step: Mode Selection */}
        {currentStep === 'mode' && (
          <SendModeSelector onSelectMode={handleModeSelect} />
        )}

        {/* Step: User Search */}
        {currentStep === 'user-search' && (
          <UserSearchSend
            onSelectUser={handleUserSelect}
            onBack={handleBack}
          />
        )}

        {/* Step: Token Selection */}
        {currentStep === 'token' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center">
              {t('token.title', 'Select Token')}
            </h2>
            
            <TokenQuickSelect
              tokens={tokens}
              selectedToken={selectedToken}
              onSelectToken={handleTokenSelect}
              isLoading={isLoadingTokens}
              isConnected={isConnected}
            />

            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full h-12"
            >
              {t('buttons.back', 'Back')}
            </Button>
          </div>
        )}

        {/* Step: Amount & Destination */}
        {currentStep === 'details' && selectedToken && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center">
              {t('details.title', 'Enter Details')}
            </h2>

            {/* Selected token display */}
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-sm font-bold">{selectedToken.symbol[0]}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium">{selectedToken.symbol}</div>
                <div className="text-sm text-muted-foreground">{selectedToken.name}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('token')}
                className="text-primary"
              >
                {t('buttons.change', 'Change')}
              </Button>
            </div>

            {/* Amount input */}
            <AmountInputCard
              amount={amount}
              onAmountChange={setAmount}
              selectedToken={selectedToken}
              error={amountError}
            />

            {/* Destination */}
            <DestinationCard
              mode={sendMode || 'address'}
              address={cryptoAddress}
              onAddressChange={setCryptoAddress}
              selectedUser={selectedUser}
              onClearUser={handleClearUser}
              recentRecipients={recipients}
              onSelectRecent={handleSelectRecent}
            />

            {/* Network info */}
            <div className="p-3 rounded-xl bg-muted/30 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('details.network', 'Network')}</span>
              <span className="font-medium">{selectedCrypto.network}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12"
              >
                {t('buttons.back', 'Back')}
              </Button>
              <Button
                onClick={handleProceedToConfirm}
                disabled={!canProceed}
                className="flex-1 h-12"
              >
                {t('buttons.continue', 'Continue')}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirmation */}
        {currentStep === 'confirm' && selectedToken && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center">
              {t('confirmation.title', 'Confirm Transaction')}
            </h2>

            <TransactionSummaryCard
              amount={amount}
              selectedToken={selectedToken}
              destinationAddress={cryptoAddress}
              selectedUser={selectedUser}
              network={selectedCrypto.network}
              txHash={txHash}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 h-12"
              >
                {t('buttons.back', 'Back')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !!txHash}
                className="flex-1 h-12 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('confirmation.processing', 'Processing...')}
                  </>
                ) : txHash ? (
                  <>
                    <Check className="h-4 w-4" />
                    {t('confirmation.completed', 'Completed')}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {t('confirmation.confirm', 'Verify & Send')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawFlow;
