import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Check, Loader2 } from 'lucide-react';
import { PinInput } from '@/features/security';
import { usePinManagement } from '@/features/security';
import { useOnboarding } from '../../hooks';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { OnboardingStepProps } from '../../types';

export function PinSetupStep({ onNext, onBack }: OnboardingStepProps) {
  const { t } = useTranslation('auth');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm' | 'success'>('create');
  const [isLoading, setIsLoading] = useState(false);
  
  const { pinStatus, isLoading: isPinStatusLoading, createPin } = usePinManagement();
  const { setOnboardingProgress } = useOnboarding();

  // Check if a PIN already exists
  useEffect(() => {
    if (!isPinStatusLoading && pinStatus?.hasPin) {
      logger.info('PIN already exists, skipping PIN setup step');
      setOnboardingProgress('profile');
      onNext?.();
    }
  }, [pinStatus?.hasPin, isPinStatusLoading, onNext, setOnboardingProgress]);

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('create');
      setPin('');
      setConfirmPin('');
    } else {
      onBack?.();
    }
  };

  const handleCreatePin = async () => {
    if (pin.length !== 6) {
      toast.error(t('onboarding.steps.pin.errors.length'));
      return;
    }

    setStep('confirm');
  };

  const handleConfirmPin = async () => {
    if (confirmPin !== pin) {
      toast.error(t('onboarding.steps.pin.errors.mismatch'));
      setConfirmPin('');
      return;
    }

    setIsLoading(true);
    try {
      await createPin(pin);
      setOnboardingProgress('profile');
      
      logger.info('PIN created successfully during onboarding');
      setStep('success');
      
      setTimeout(() => {
        onNext?.();
      }, 2000);
    } catch (error) {
      logger.error('Failed to create PIN:', error);
      toast.error(t('onboarding.steps.pin.errors.createFailed'));
      setStep('create');
      setPin('');
      setConfirmPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'create':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">{t('onboarding.steps.pin.createTitle')}</h2>
                <p className="text-muted-foreground text-sm">
                  {t('onboarding.steps.pin.createSubtitle')}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                 <PinInput
                   value={pin}
                   onChange={setPin}
                 />
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm">{t('onboarding.steps.pin.securityTips')}</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>{t('onboarding.steps.pin.tip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>{t('onboarding.steps.pin.tip2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>{t('onboarding.steps.pin.tip3')}</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleCreatePin}
                disabled={pin.length !== 6}
                className="w-full min-h-[52px] text-base font-semibold rounded-xl"
                size="lg"
              >
                {t('onboarding.steps.pin.continue')}
              </Button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">{t('onboarding.steps.pin.confirmTitle')}</h2>
                <p className="text-muted-foreground text-sm">
                  {t('onboarding.steps.pin.confirmSubtitle')}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                 <PinInput
                   value={confirmPin}
                   onChange={setConfirmPin}
                 />
              </div>

              <Button
                onClick={handleConfirmPin}
                disabled={confirmPin.length !== 6 || isLoading}
                className="w-full min-h-[52px] text-base font-semibold rounded-xl"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    {t('onboarding.steps.pin.creating')}
                  </>
                ) : (
                  t('onboarding.steps.pin.confirm')
                )}
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">{t('onboarding.steps.pin.successTitle')}</h2>
                <p className="text-muted-foreground text-sm">
                  {t('onboarding.steps.pin.successSubtitle')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loader during PIN status check
  if (isPinStatusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">{t('onboarding.steps.pin.verification')}</h2>
            <p className="text-muted-foreground text-sm">{t('onboarding.steps.pin.verificationSubtitle')}</p>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col relative safe-area-top">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/20">
        <div className="flex items-center px-4 py-3">
          <Button variant="ghost" size="lg" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-semibold text-foreground">{t('onboarding.steps.pin.title')}</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
            </div>
          </div>
          
          <div className="w-[44px]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-safe">
        <div className="max-w-sm mx-auto">
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
}
