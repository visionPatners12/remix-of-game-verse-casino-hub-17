import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, AlertCircle, Loader2, Wallet } from 'lucide-react';
import { Button, Input, Label, Card, CardContent, Skeleton } from '@/ui';
import { StepProgressIndicator } from '@/components/shared/StepProgressIndicator';
import { PinVerification } from '@/features/security';
import { useWithdraw } from '../hooks/useWithdraw';
import { usePinManagement } from '@/features/security';
import { useResponsive } from '@/hooks/useResponsive';
import { logger } from '@/utils/logger';
import { isAddress, formatUnits } from 'viem';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useWalletTokensThirdWeb } from '@/features/wallet/hooks/tokens/useWalletTokensThirdWeb';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { TokenIcon } from '@web3icons/react/dynamic';
import { WalletToken } from '@/features/wallet/types';

// Token icon component with fallback
const WithdrawTokenIcon = ({ token, size = 'md' }: { token: WalletToken | null; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8'
  };
  
  if (!token?.symbol) {
    return (
      <div className={cn(sizeClasses[size], "rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center")}>
        <span className="text-xs font-medium text-primary">?</span>
      </div>
    );
  }
  
  return (
    <TokenIcon
      symbol={token.symbol}
      className={sizeClasses[size]}
      variant="branded"
    />
  );
};

const WithdrawFlow = () => {
  const navigate = useNavigate();
  const { isMobile, isDesktop } = useResponsive();
  const {
    currentStep,
    selectedToken,
    setSelectedToken,
    amount,
    cryptoAddress,
    selectedCrypto,
    isLoading,
    isSubmitting,
    txHash,
    walletBalance,
    address,
    setAmount,
    setCryptoAddress,
    handleNextStep,
    handlePrevStep,
    executeBlockchainWithdraw,
  } = useWithdraw();

  // Fetch wallet tokens for Step 0
  const { tokens, isLoading: isLoadingTokens, error: tokensError, isConnected } = useWalletTokensThirdWeb();

  const { pinStatus, verifyPin, isVerifying } = usePinManagement();

  // PIN verification required on load
  useEffect(() => {
    if (pinStatus && (!pinStatus.hasPin || !pinStatus.isEnabled)) {
      toast({
        title: "PIN Required",
        description: "A PIN code is required for withdrawals. You will be redirected to settings.",
        variant: "destructive"
      });
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
          description: "Processing your withdrawal...",
        });
        
        // Auto-trigger transaction after PIN verification
        try {
          const hash = await executeBlockchainWithdraw();
          if (hash) {
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

  const handleSubmit = async () => {
    // Verify PIN before proceeding
    if (!isPinVerified) {
      setShowPinVerification(true);
      return;
    }

    try {
        const hash = await executeBlockchainWithdraw();
      if (hash) {
        // Navigate after success
        setTimeout(() => navigate('/wallet'), 3000);
      }
    } catch (error) {
      // Error already handled in executeBlockchainWithdraw
      logger.error('Withdrawal error:', error);
    }
  };

  const stepLabels = ['Token', 'Details', 'Confirm'];

  // Check if can proceed to next step
  const canProceedFromDetails = 
    amount && 
    parseFloat(amount) > 0 && 
    isAddress(cryptoAddress) && 
    address &&
    selectedToken &&
    parseFloat(amount) <= parseFloat(selectedToken.balance);

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

      {/* Don't show main content if PIN not configured */}
      {pinStatus && (!pinStatus.hasPin || !pinStatus.isEnabled) ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">PIN Required</h2>
              <p className="text-muted-foreground">
                A PIN code is required for withdrawals. You will be redirected to settings.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <MobilePageHeader title="Withdraw Funds" />

          {/* Progress Indicator */}
          <div className={cn(
            isMobile ? "px-4" : "max-w-4xl mx-auto px-6"
          )}>
            <StepProgressIndicator
              currentStep={currentStep}
              totalSteps={3}
              stepLabels={stepLabels}
            />
          </div>

          {/* Content */}
          <div className={cn(
            "pb-20",
            isMobile ? "px-4" : "max-w-4xl mx-auto px-6"
          )}>
            {/* Step 0: Token Selection */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <h2 className={cn(
                  "font-semibold mb-4",
                  isMobile ? "text-xl" : "text-2xl text-center"
                )}>Select Token</h2>

                {!isConnected ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
                      <p className="text-muted-foreground">
                        Please connect your wallet to see your available tokens
                      </p>
                    </CardContent>
                  </Card>
                ) : isLoadingTokens ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="text-right space-y-2">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : tokensError ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-destructive">Error loading tokens</p>
                    </CardContent>
                  </Card>
                ) : tokens.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Tokens Available</h3>
                      <p className="text-muted-foreground">
                        Your wallet doesn't contain any tokens at the moment
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {tokens.map((token) => (
                      <Card
                        key={token.contractAddress}
                        className={cn(
                          "cursor-pointer transition-all hover:bg-muted/50 hover:scale-[1.01]",
                          selectedToken?.contractAddress === token.contractAddress && "border-primary bg-primary/5"
                        )}
                        onClick={() => {
                          setSelectedToken(token);
                          handleNextStep();
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                  <WithdrawTokenIcon token={token} size="md" />
                                </div>
                                {token.type && (
                                  <div className="absolute -bottom-1 -right-1 bg-background border border-border rounded-full px-1 text-[9px] font-medium">
                                    {token.type === 'Native' ? 'N' : token.type === 'BEP-20' ? 'B' : 'E'}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{token.name}</div>
                                <div className="text-sm text-muted-foreground">{token.symbol}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{parseFloat(token.balance).toFixed(4)}</div>
                              <div className="text-sm text-muted-foreground">
                                ${token.quote.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className={cn(
                  isMobile ? "mt-6" : "flex justify-center"
                )}>
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className={cn(
                      isMobile ? "w-full" : "px-8"
                    )}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: Amount & Destination Address */}
            {currentStep === 1 && selectedToken && (
              <div className={cn(
                "space-y-6",
                isDesktop && "max-w-md mx-auto"
              )}>
                <div className="text-center space-y-3">
                  <h2 className={cn(
                    "font-semibold mb-2",
                    isMobile ? "text-xl" : "text-2xl"
                  )}>Withdrawal Details</h2>
                </div>

                {/* Selected Token Display */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <WithdrawTokenIcon token={selectedToken} size="md" />
                        </div>
                        <div>
                          <div className="font-medium">{selectedToken.symbol}</div>
                          <div className="text-sm text-muted-foreground">{selectedToken.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Available Balance</div>
                        <div className="font-medium">{parseFloat(selectedToken.balance).toFixed(4)} {selectedToken.symbol}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Amount Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="amount">Amount</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAmount(selectedToken.balance)}
                      className="text-xs text-primary hover:text-primary/80 h-auto py-1"
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={cn(
                        "text-lg pr-16",
                        amount && parseFloat(amount) > parseFloat(selectedToken.balance) && "border-destructive"
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                      {selectedToken.symbol}
                    </div>
                  </div>
                  {amount && parseFloat(amount) > parseFloat(selectedToken.balance) && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Insufficient balance
                    </p>
                  )}
                </div>

                {/* Destination Address */}
                <div className="space-y-2">
                  <Label htmlFor="crypto-address">Destination Address</Label>
                  <Input
                    id="crypto-address"
                    placeholder="0x..."
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    className={cn(
                      "font-mono text-sm",
                      cryptoAddress && !isAddress(cryptoAddress) && "border-destructive"
                    )}
                  />
                  {cryptoAddress && !isAddress(cryptoAddress) && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Invalid address format
                    </p>
                  )}
                  {cryptoAddress && isAddress(cryptoAddress) && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Valid address
                    </p>
                  )}
                </div>

                {/* Network Info */}
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-medium">{selectedCrypto.network}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={!canProceedFromDetails || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Verifying..." : "Continue"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Confirmation */}
            {currentStep === 2 && selectedToken && (
              <div className={cn(
                "space-y-6",
                isDesktop && "max-w-md mx-auto"
              )}>
                <div className="text-center space-y-3">
                  <h2 className={cn(
                    "font-semibold mb-2",
                    isMobile ? "text-xl" : "text-2xl"
                  )}>Confirm Withdrawal</h2>
                  <p className="text-muted-foreground">
                    Review your transaction details
                  </p>
                </div>

                {/* Transaction Summary */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <span className="text-muted-foreground">Token</span>
                      <div className="flex items-center gap-2">
                        <WithdrawTokenIcon token={selectedToken} size="sm" />
                        <span className="font-medium">{selectedToken.symbol}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium text-lg">{amount} {selectedToken.symbol}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <span className="text-muted-foreground">Destination</span>
                      <span className="font-mono text-sm">{cryptoAddress.slice(0, 8)}...{cryptoAddress.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-medium">{selectedCrypto.network}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Hash if available */}
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
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">{txHash}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(txHash);
                            toast({ title: "Copied", description: "Transaction hash copied to clipboard" });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Warning */}
                <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                  <CardContent className="p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Please verify the destination address carefully. Transactions cannot be reversed.
                    </p>
                  </CardContent>
                </Card>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={handlePrevStep} className="flex-1" disabled={isSubmitting}>
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !address || !isAddress(cryptoAddress) || !!txHash}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : txHash ? (
                      "Completed"
                    ) : (
                      "Confirm Withdrawal"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WithdrawFlow;
