
import React, { useState } from 'react';
import { Button, InputOTP, InputOTPGroup, InputOTPSlot } from "@/ui";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { logger } from '@/utils/logger';
import { supabase } from "@/integrations/supabase/client";

interface TokenConfirmationFormProps {
  email: string;
  onResendToken?: () => void;
}

export const TokenConfirmationForm = ({ email, onResendToken }: TokenConfirmationFormProps) => {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const handleConfirmToken = async () => {
    if (token.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) {
        logger.error('Token verification error:', error);
        
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          toast.error("Invalid or expired confirmation code. Please request a new code.");
        } else if (error.message.includes('otp_expired')) {
          toast.error("The code has expired. A new code has been sent.");
        } else {
          toast.error("Invalid confirmation code");
        }
        
        setToken("");
        return;
      }

      toast.success("Email confirmed successfully!");
      navigate('/onboarding');
    } catch (error: any) {
      logger.error('Confirmation error:', error);
      toast.error("Error during confirmation");
      setToken("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendToken = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        logger.error('Resend error:', error);
        toast.error("Error sending code");
        return;
      }

      toast.success("New code sent successfully!");
    } catch (error) {
      logger.error('Resend error:', error);
      toast.error("Error sending code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Mail className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white">Confirm your email</h2>
        <p className="text-slate-300 text-sm">
          We have sent a confirmation code to
        </p>
        <p className="text-purple-400 font-medium">{email}</p>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <label className="text-sm font-medium text-slate-300 block mb-3">
            Enter the 6-digit code
          </label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={token}
              onChange={setToken}
              className="gap-2"
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot 
                  index={0} 
                  className="w-12 h-12 text-lg font-bold bg-slate-800/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500/20" 
                />
                <InputOTPSlot 
                  index={1} 
                  className="w-12 h-12 text-lg font-bold bg-slate-800/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500/20" 
                />
                <InputOTPSlot 
                  index={2} 
                  className="w-12 h-12 text-lg font-bold bg-slate-800/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500/20" 
                />
                <InputOTPSlot 
                  index={3} 
                  className="w-12 h-12 text-lg font-bold bg-slate-800/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500/20" 
                />
                <InputOTPSlot 
                  index={4} 
                  className="w-12 h-12 text-lg font-bold bg-slate-800/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500/20" 
                />
                <InputOTPSlot 
                  index={5} 
                  className="w-12 h-12 text-lg font-bold bg-slate-800/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500/20" 
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          onClick={handleConfirmToken}
          disabled={isLoading || token.length !== 6}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Confirming...
            </>
          ) : (
            "Confirm my email"
          )}
        </Button>
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-slate-400">
          Didn't receive the code?
        </p>
        <Button
          variant="ghost"
          onClick={handleResendToken}
          disabled={isResending}
          className="text-purple-400 hover:text-purple-300"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend code
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
