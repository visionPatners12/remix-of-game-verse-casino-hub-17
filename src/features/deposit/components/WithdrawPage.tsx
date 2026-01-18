import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Bitcoin, Banknote, Copy, Check } from 'lucide-react';
import { Button, Input, Label, Card, CardContent, InputOTP, InputOTPGroup, InputOTPSlot } from '@/ui';
import { CryptoSelector } from '@/components/shared/CryptoSelector';
import { StepProgressIndicator } from '@/components/shared/StepProgressIndicator';
import { PinVerification } from '@/features/security';
import { useWithdraw } from '../hooks/useWithdraw';
import { usePinManagement } from '@/features/security';
import { WithdrawalMethod, MobileProvider } from '@/types/wallet';
import { logger } from '@/utils/logger';
import { isAddress } from 'viem';
import { formatUnits } from 'viem';
import { toast } from '@/hooks/use-toast';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';

const WithdrawPage = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    selectedMethod,
    amount,
    phoneNumber,
    mobileProvider,
    cryptoAddress,
    selectedCrypto,
    otp,
    isLoading,
    isSubmitting,
    txHash,
    walletBalance,
    address,
    setAmount,
    setPhoneNumber,
    setMobileProvider,
    setCryptoAddress,
    setSelectedCrypto,
    setOtp,
    handleMethodSelect,
    handleNextStep,
    handlePrevStep,
    executeBlockchainWithdraw,
    createWithdrawalRequest
  } = useWithdraw();

  const { pinStatus, verifyPin, isVerifying } = usePinManagement();

  // Mandatory PIN verification on load
  useEffect(() => {
    if (pinStatus && (!pinStatus.hasPin || !pinStatus.isEnabled)) {
      toast({
        title: "PIN Required",
        description: "A PIN code is required to make withdrawals. You will be redirected to settings.",
        variant: "destructive"
      });
      // Redirect after 2 seconds
      setTimeout(() => navigate('/settings/pin?from=withdraw'), 2000);
    }
  }, [pinStatus, navigate]);

  // PIN verification state
  const [isPinVerified, setIsPinVerified] = React.useState(false);
  const [showPinVerification, setShowPinVerification] = React.useState(false);

  const handlePinVerification = async (pin: string) => {
    try {
      const isValid = await verifyPin(pin);
      if (isValid) {
        setIsPinVerified(true);
        setShowPinVerification(false);
        toast({
          title: "PIN Verified",
          description: "You can now proceed with the withdrawal.",
        });
        return true;
      } else {
        throw new Error('Incorrect PIN');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Verify PIN before proceeding
    if (!isPinVerified) {
      setShowPinVerification(true);
      return;
    }

    if (selectedMethod === 'crypto') {
      try {
        const hash = await executeBlockchainWithdraw();
        if (hash) {
          // Navigate after success with transaction hash
          setTimeout(() => navigate('/mobile-menu'), 3000);
        }
      } catch (error) {
        // Error is already handled in executeBlockchainWithdraw
      }
    } else {
      const request = createWithdrawalRequest();
      logger.debug('Withdrawal request submitted:', request);
      alert('Withdrawal request submitted successfully!');
      navigate('/mobile-menu');
    }
  };


  const navigateToSettings = () => {
    navigate('/settings');
  };

  const methods = [
    {
      id: 'mobile-money' as WithdrawalMethod,
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'Orange Money, MTN, Wave'
    },
    {
      id: 'bank-transfer' as WithdrawalMethod,
      name: 'Bank Transfer',
      icon: CreditCard,
      description: 'Direct bank transfer'
    },
    {
      id: 'crypto' as WithdrawalMethod,
      name: 'Cryptocurrency',
      icon: Bitcoin,
      description: 'Bitcoin, USDT, etc.'
    },
    {
      id: 'paypal' as WithdrawalMethod,
      name: 'PayPal',
      icon: Banknote,
      description: 'PayPal account'
    }
  ];

  const stepLabels = ['Method', 'Details', 'Verification'];

  return (
    <div className="min-h-screen bg-background">
      {/* PIN Verification Modal */}
      {showPinVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full">
            <PinVerification
              title="PIN Verification Required"
              description="Enter your PIN code to confirm the withdrawal"
              onVerify={handlePinVerification}
              onCancel={() => setShowPinVerification(false)}
              maxAttempts={3}
              lockoutDuration={5 * 60 * 1000}
            />
          </div>
        </div>
      )}

      {/* Don't display main content if PIN is not configured */}
      {pinStatus && (!pinStatus.hasPin || !pinStatus.isEnabled) ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <ArrowLeft className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">PIN Required</h2>
              <p className="text-muted-foreground">
                A PIN code is required to make withdrawals. You will be redirected to settings.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <MobilePageHeader title="Withdraw Funds" onBack={() => navigate('/games')} />

          {/* Progress Indicator */}
          <StepProgressIndicator
            currentStep={currentStep}
            totalSteps={3}
            stepLabels={stepLabels}
          />

      {/* Content */}
      <div className="px-4 pb-20">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Choose Withdrawal Method</h2>
            
            <div className="space-y-3">
              {methods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <CardContent className="flex items-center p-4">
                    <method.icon className="h-6 w-6 mr-3 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-medium">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === method.id
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`} />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleNextStep}
              disabled={!selectedMethod}
              className="w-full mt-6"
            >
              Continue
            </Button>
          </div>
        )}

        {currentStep === 2 && selectedMethod && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Withdrawal Details</h2>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
            </div>


            {/* Method-specific fields */}
            {selectedMethod === 'mobile-money' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Mobile Operator</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['orange', 'mtn', 'wave'] as MobileProvider[]).map((provider) => (
                      <Button
                        key={provider}
                        variant={mobileProvider === provider ? 'default' : 'outline'}
                        onClick={() => setMobileProvider(provider)}
                        className="capitalize"
                      >
                        {provider}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+237 6XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'crypto' && (
              <div className="space-y-4">
                {/* Available balance */}
                {address && walletBalance && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Available Balance</span>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatUnits(walletBalance.value, walletBalance.decimals)} {walletBalance.symbol}
                          </div>
                          <Button 
                            variant="link" 
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => setAmount(formatUnits(walletBalance.value, walletBalance.decimals))}
                          >
                            Use maximum
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>Cryptocurrency Type</Label>
                  <CryptoSelector
                    selectedCrypto={selectedCrypto}
                    onSelect={setSelectedCrypto}
                    variant="buttons"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crypto-address">Destination Address</Label>
                  <Input
                    id="crypto-address"
                    placeholder="0x... Enter destination address"
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    className={cryptoAddress && !isAddress(cryptoAddress) ? 'border-destructive' : ''}
                  />
                  {cryptoAddress && !isAddress(cryptoAddress) && (
                    <p className="text-xs text-destructive">Invalid address</p>
                  )}
                  {cryptoAddress && isAddress(cryptoAddress) && (
                    <p className="text-xs text-green-600">Valid address ✓</p>
                  )}
                </div>
              </div>
            )}

            {selectedMethod === 'bank-transfer' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    placeholder="Enter account holder name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    placeholder="Enter account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'paypal' && (
              <div className="space-y-2">
                <Label htmlFor="paypal-email">PayPal Email</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  placeholder="Enter PayPal email"
                />
              </div>
            )}


            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={
                  !amount || 
                  parseFloat(amount) <= 0 || 
                  isLoading ||
                  (selectedMethod === 'crypto' && (!isAddress(cryptoAddress) || !address))
                }
                className="flex-1"
              >
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
            </div>
          </div>
        )}


        {currentStep === 3 && (
          <div className="space-y-6">
            {selectedMethod === 'crypto' ? (
              // Crypto interface - Direct transaction
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Confirm Crypto Withdrawal</h2>
                  <p className="text-muted-foreground">
                    Review your transaction details
                  </p>
                </div>

                {/* Transaction summary */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">{amount} {selectedCrypto.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destination</span>
                      <span className="font-mono text-sm">{cryptoAddress.slice(0, 6)}...{cryptoAddress.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network</span>
                      <span>{selectedCrypto.network}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction hash if available */}
                {txHash && (
                  <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Transaction Sent
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Hash:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{txHash.slice(0, 10)}...{txHash.slice(-8)}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(txHash)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={handlePrevStep} className="flex-1" disabled={isSubmitting}>
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !address || !isAddress(cryptoAddress)}
                    className="flex-1"
                  >
                    {isSubmitting ? "Transaction in progress..." : "Confirm Withdrawal"}
                  </Button>
                </div>
              </div>
            ) : (
              // Traditional interface - Code verification
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Verify Your Request</h2>
                  <p className="text-muted-foreground">
                    Enter the 6-digit code sent to your registered email
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button 
                  variant="link" 
                  className="w-full text-primary"
                  onClick={() => {
                    toast({
                      title: "Code resent",
                      description: "A new verification code has been sent to your email"
                    });
                  }}
                >
                  Resend code
                </Button>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={otp.length !== 6 || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Withdrawal"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default WithdrawPage;
