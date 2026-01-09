import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/ui';
import { OnboardingStepProps } from '../../types';
import { SmsVerificationForm } from '../sms';
import { useUserProfile } from '@/features/profile';

export function SmsVerificationStep({ onNext, onBack }: OnboardingStepProps) {
  const { profile } = useUserProfile();

  const phoneNumber = profile?.phone || '';

  const handleVerificationSuccess = () => {
    // SMS verification completed, go to next step
    onNext?.();
  };

  const handleSkip = () => {
    // Skip SMS verification for now, go to next step
    onNext?.();
  };

  if (!phoneNumber) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              SMS Verification
            </h1>
          </div>

          {/* No phone number */}
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Phone number required
              </h2>
              <p className="text-muted-foreground">
                You must first add a phone number to your profile to continue.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button onClick={onBack} className="w-full">
                Back to profile
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSkip} 
                className="w-full"
              >
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            SMS Verification
          </h1>
        </div>

        {/* SMS Verification Form */}
        <SmsVerificationForm
          phoneNumber={phoneNumber}
          onVerificationSuccess={handleVerificationSuccess}
          onBack={onBack}
        />

        {/* Skip option */}
        <div className="max-w-md mx-auto mt-8 text-center">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip this step
          </Button>
        </div>
      </div>
    </div>
  );
}