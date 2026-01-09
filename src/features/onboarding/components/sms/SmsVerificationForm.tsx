import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/ui';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Wifi } from 'lucide-react';
import { collectDeviceInfo } from '../../utils/device-info';
import { SendVerificationRequest, VerifyCodeRequest, VerificationResponse } from '../../types/sms';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';

interface SmsVerificationFormProps {
  phoneNumber: string;
  onVerificationSuccess: () => void;
  onBack?: () => void;
}

export function SmsVerificationForm({ 
  phoneNumber, 
  onVerificationSuccess, 
  onBack 
}: SmsVerificationFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationResponse, setVerificationResponse] = useState<VerificationResponse | null>(null);
  const [silentVerificationAvailable, setSilentVerificationAvailable] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleSendVerification = async () => {
    if (!phoneNumber) {
      toast.error("Error", { description: "Phone number missing" });
      return;
    }

    setIsResending(true);
    try {
      // Collect device information for anti-fraud
      const deviceInfo = await collectDeviceInfo();
      
      const requestBody: SendVerificationRequest = {
        action: 'send',
        phone: phoneNumber,
        signals: deviceInfo
      };

      const { data, error } = await supabase.functions.invoke('sms-verification', {
        body: requestBody
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Error sending SMS');
      }
      
      // Store the verification response for enhanced UX
      setVerificationResponse(data);
      
      // Check if silent verification is available
      if (data.silent_request_url) {
        setSilentVerificationAvailable(true);
      }
      
      // Show appropriate message based on method
      let toastMessage = data?.message || `Verification code sent to ${phoneNumber}`;
      if (data.method === 'voice') {
        toastMessage = `Verification code sent via voice call to ${phoneNumber}`;
      } else if (data.method === 'silent') {
        toastMessage = `Silent verification available for ${phoneNumber}`;
      }
      
      if (data.status === 'blocked') {
        toast.error("Verification Blocked", { description: toastMessage });
      } else {
        toast.success("Verification Sent", { description: toastMessage });
      }
      
      setTimeLeft(60);
      setCanResend(false);
    } catch (error: unknown) {
      toast.error("Error", { 
        description: error instanceof Error ? error.message : "Unable to send SMS" 
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Invalid Code", { description: "Please enter a 6-digit code" });
      return;
    }

    setIsLoading(true);
    try {
      const requestBody: VerifyCodeRequest = {
        action: 'verify',
        phone: phoneNumber, 
        code: verificationCode 
      };

      const { data, error } = await supabase.functions.invoke('sms-verification', {
        body: requestBody
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Invalid verification code');
      }

      // Save verified phone to database
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          phone: phoneNumber,
          phone_verified: true 
        })
        .eq('id', user?.id);

      if (updateError) {
        console.error('Error saving phone:', updateError);
        toast.error("Error", { description: "Phone verified but error saving" });
        return;
      }

      toast.success("Phone Verified", { 
        description: data?.message || "Your phone number has been successfully verified" 
      });
      
      // Invalidate user profile cache to refresh verification status
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      
      onVerificationSuccess();
    } catch (error: unknown) {
      toast.error("Verification Failed", { 
        description: error instanceof Error ? error.message : "Invalid verification code" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSilentVerification = async () => {
    if (!verificationResponse?.silent_request_url) return;
    
    try {
      // Open silent verification URL
      window.open(verificationResponse.silent_request_url, '_blank');
      
      toast.success("Silent Verification", {
        description: "Silent verification started. The page will update automatically."
      });
    } catch (error) {
      console.error('Silent verification error:', error);
      toast.error("Error", { description: "Unable to start silent verification" });
    }
  };

  // Send initial SMS when component mounts
  useEffect(() => {
    handleSendVerification();
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Phone Number Display */}
      <div className="text-center space-y-4">
        <div className="bg-muted/50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
          <Phone className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Verification Code
          </h2>
          <p className="text-muted-foreground">
            We sent a 6-digit code to the number
          </p>
          <p className="font-medium text-foreground mt-1">
            {phoneNumber}
          </p>
        </div>
      </div>

      {/* Silent Verification Option */}
      {silentVerificationAvailable && verificationResponse?.silent_request_url && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Silent verification available</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Verify your number automatically without entering a code
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSilentVerification}
            className="w-full"
          >
            <Wifi className="h-4 w-4 mr-2" />
            Silent Verification
          </Button>
        </div>
      )}

      {/* Verification Method Info */}
      {verificationResponse?.method && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Method: {
              verificationResponse.method === 'voice' ? 'Voice Call' :
              verificationResponse.method === 'silent' ? 'Silent' :
              verificationResponse.method === 'message' ? 'SMS' :
              verificationResponse.method
            }
            {verificationResponse.channels && verificationResponse.channels.length > 0 && (
              <span> • Channels: {verificationResponse.channels.join(', ')}</span>
            )}
          </p>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleVerifyCode} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl tracking-widest"
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || verificationCode.length !== 6}
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </form>

      {/* Resend Section */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?
        </p>
        {canResend ? (
          <Button
            variant="ghost"
            onClick={handleSendVerification}
            disabled={isResending}
            className="text-primary hover:text-primary/80"
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Resend in {timeLeft}s
          </p>
        )}
      </div>
    </div>
  );
}