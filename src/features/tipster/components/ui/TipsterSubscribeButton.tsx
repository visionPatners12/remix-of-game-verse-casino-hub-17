import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { useTipsterSubscription } from '../../hooks/useTipsterSubscription';
import { useSubscriptionStatus } from '@/hooks/useSubscription';
import { usePinManagement, PinVerification } from '@/features/security';
import { UnifiedModal } from '@/components/unified/UnifiedModal';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { useWalletDeepLink } from '@/hooks/useWalletDeepLink';

interface TipsterSubscribeButtonProps {
  tipsterId: string;
  monthlyPrice: number;
  disabled?: boolean;
  splitContractAddress: string;
}

export function TipsterSubscribeButton({ 
  tipsterId, 
  monthlyPrice, 
  disabled = false,
  splitContractAddress,
}: TipsterSubscribeButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use unified wallet for consistent connection state
  const { 
    isConnected, 
    isRecoveringSession, 
    needsPrivyReconnection,
    connectWallet 
  } = useUnifiedWallet();
  
  const { hash, isPending, isSuccess, subscribe } = useTipsterSubscription();
  const { data: subscriptionResult } = useSubscriptionStatus(tipsterId);
  const { pinStatus, verifyPin, isVerifying } = usePinManagement();
  const { openWallet, isMobilePwa, hasWallet } = useWalletDeepLink();
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  
  const subscriptionData = subscriptionResult?.data;
  const subscriptionStatus = subscriptionData?.status;
  
  // Check if subscription is expired
  const isExpired = subscriptionData?.subscription_end 
    ? new Date(subscriptionData.subscription_end) < new Date() 
    : false;

  // Execute subscription after PIN verification
  useEffect(() => {
    if (isPinVerified && showPinModal === false) {
      executeSubscription();
    }
  }, [isPinVerified]);

  const executeSubscription = async () => {
    try {
      await subscribe(tipsterId, monthlyPrice, splitContractAddress);
      
      // Auto-open wallet on mobile PWA
      if (isMobilePwa && hasWallet) {
        setTimeout(() => openWallet(), 500);
      }
    } catch (error) {
      logger.error('Subscription error:', error);
    } finally {
      setIsPinVerified(false);
    }
  };

  const handlePinVerification = async (pin: string) => {
    try {
      const isValid = await verifyPin(pin);
      if (isValid) {
        setIsPinVerified(true);
        setShowPinModal(false);
        toast({
          title: "PIN Verified",
          description: "Processing your subscription...",
        });
        return true;
      } else {
        throw new Error('Incorrect PIN');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSubscribe = async () => {
    // If recovering, do nothing
    if (isRecoveringSession) return;
    
    // If not connected or needs reconnection, open wallet
    if (!isConnected || needsPrivyReconnection) {
      connectWallet();
      return;
    }

    // Check if user has PIN configured
    if (!pinStatus?.hasPin || !pinStatus?.isEnabled) {
      toast({
        title: "PIN Required",
        description: "A PIN code is required for subscriptions. Redirecting to settings...",
        variant: "destructive"
      });
      setTimeout(() => navigate('/settings/pin?from=subscription'), 2000);
      return;
    }
    
    // Show PIN verification modal
    setShowPinModal(true);
  };

  const getButtonState = () => {
    if (isPending) return { text: "Processing...", variant: "default" as const, disabled: true };
    if (isRecoveringSession) return { text: "Loading...", variant: "default" as const, disabled: true };
    if (needsPrivyReconnection) return { text: "Reconnect Wallet", variant: "default" as const, disabled: false };
    if (!isConnected) return { text: "Connect Wallet", variant: "default" as const, disabled: false };
    if (isSuccess) return { text: "Confirmed", variant: "secondary" as const, disabled: true };
    
    // Based on subscription status from DB
    if (subscriptionStatus === 'pending') {
      return { text: "Payment Pending", variant: "outline" as const, disabled: true };
    }
    if (subscriptionStatus === 'active' && !isExpired) {
      return { text: "Subscribed", variant: "secondary" as const, disabled: true };
    }
    if (isExpired) {
      return { text: "Renew Subscription", variant: "default" as const, disabled: false };
    }
    
    return { text: `Subscribe ${monthlyPrice} USDC/month`, variant: "default" as const, disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSubscribe}
        disabled={disabled || buttonState.disabled}
        variant={buttonState.variant}
        size="sm"
        className={`h-8 ${subscriptionStatus === 'pending' ? 'border-yellow-500 text-yellow-600' : ''}`}
      >
        {buttonState.text}
      </Button>

      {/* Open Wallet Button - Mobile PWA fallback */}
      {isMobilePwa && hasWallet && isPending && (
        <Button
          onClick={openWallet}
          variant="outline"
          size="sm"
          className="h-8 w-full border-primary/30 text-primary hover:bg-primary/10"
        >
          <ExternalLink className="mr-2 h-3 w-3" />
          Open Wallet to Confirm
        </Button>
      )}
      
      {/* Show tx hash for pending subscriptions */}
      {subscriptionStatus === 'pending' && subscriptionData?.tx_hash && (
        <div className="text-xs text-yellow-600">
          <p>Tx: {subscriptionData.tx_hash.slice(0, 10)}...{subscriptionData.tx_hash.slice(-6)}</p>
          <a 
            href={`https://polygonscan.com/tx/${subscriptionData.tx_hash}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            View on PolygonScan
          </a>
        </div>
      )}
      
      {/* Show tx hash for successful new transactions */}
      {hash && !subscriptionData?.tx_hash && (
        <div className="text-xs text-muted-foreground">
          <p>Tx: {hash.slice(0, 10)}...{hash.slice(-8)}</p>
          {isSuccess && (
            <p className="text-green-600">Transaction sent - Pending verification</p>
          )}
        </div>
      )}

      {/* PIN Verification Modal */}
      <UnifiedModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        title="Security Verification"
        description={`Enter your PIN to confirm subscription (${monthlyPrice} USDC/month)`}
        size="sm"
      >
        <PinVerification
          onVerify={handlePinVerification}
          title="Enter your PIN"
          description="Required for subscription payment"
          onCancel={() => setShowPinModal(false)}
          maxAttempts={5}
          lockoutDuration={5}
        />
      </UnifiedModal>
    </div>
  );
}
