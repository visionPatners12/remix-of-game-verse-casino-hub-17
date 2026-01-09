import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/ui';
import { SmsVerificationForm } from '@/features/onboarding/components/sms';
import { useUserProfile } from '@/features/profile/hooks';

export default function SettingsSmsVerificationPage() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  
  const phoneNumber = profile?.phone || '';

  const handleVerificationSuccess = () => {
    navigate('/settings');
  };

  if (!phoneNumber) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">
            Missing Phone Number
          </h2>
          <p className="text-muted-foreground">
            Please return to settings to add a phone number.
          </p>
          <Button onClick={() => navigate('/settings')} className="w-full">
            Back to Settings
          </Button>
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
            onClick={() => navigate('/settings')}
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
          onBack={() => navigate('/settings')}
        />
      </div>
    </div>
  );
}