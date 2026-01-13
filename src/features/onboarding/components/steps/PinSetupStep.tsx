import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Check, Loader2, Lock, Fingerprint } from 'lucide-react';
import { PinInput } from '@/features/security';
import { usePinManagement } from '@/features/security';
import { useOnboarding } from '../../hooks';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { OnboardingStepProps } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingLayout } from '../OnboardingLayout';

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-1.5">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <motion.div
        key={index}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          index < currentStep ? 'bg-primary w-8' : 'bg-muted w-6'
        }`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: index * 0.05 }}
      />
    ))}
  </div>
);

export function PinSetupStep({ onNext, onBack }: OnboardingStepProps) {
  const { t } = useTranslation('auth');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm' | 'success'>('create');
  const [isLoading, setIsLoading] = useState(false);
  
  const { pinStatus, isLoading: isPinStatusLoading, createPin } = usePinManagement();
  const { setOnboardingProgress } = useOnboarding();

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

  if (isPinStatusLoading) {
    return (
      <OnboardingLayout backgroundVariant="amber">
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mx-auto relative">
                <Shield className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">{t('onboarding.steps.pin.verification')}</h2>
              <p className="text-muted-foreground text-sm">{t('onboarding.steps.pin.verificationSubtitle')}</p>
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </motion.div>
        </div>
      </OnboardingLayout>
    );
  }

  const renderBottomAction = () => {
    if (step === 'create') {
      return (
        <Button
          onClick={handleCreatePin}
          disabled={pin.length !== 6}
          className="w-full py-6 text-base font-semibold rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25 min-h-[56px] active:scale-[0.98] transition-transform"
          size="lg"
        >
          {t('onboarding.steps.pin.continue')}
        </Button>
      );
    }

    if (step === 'confirm') {
      return (
        <Button
          onClick={handleConfirmPin}
          disabled={confirmPin.length !== 6 || isLoading}
          className="w-full py-6 text-base font-semibold rounded-2xl min-h-[56px] active:scale-[0.98] transition-transform"
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
      );
    }

    return null;
  };

  return (
    <OnboardingLayout 
      backgroundVariant="amber"
      bottomAction={step !== 'success' ? renderBottomAction() : undefined}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="flex items-center px-4 py-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-xl min-h-[44px] min-w-[44px]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-semibold text-foreground">{t('onboarding.steps.pin.title')}</h1>
            <div className="mt-2">
              <ProgressBar currentStep={2} totalSteps={4} />
            </div>
          </div>
          
          <div className="w-11" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-8">
        <div className="max-w-sm mx-auto">
          <AnimatePresence mode="wait">
            {step === 'create' && (
              <motion.div 
                key="create"
                className="space-y-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Icon & Title */}
                <div className="text-center space-y-4">
                  <motion.div 
                    className="relative inline-block"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-orange-500/10 blur-2xl rounded-full scale-150" />
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto relative shadow-xl shadow-amber-500/25">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t('onboarding.steps.pin.createTitle')}</h2>
                    <p className="text-muted-foreground">
                      {t('onboarding.steps.pin.createSubtitle')}
                    </p>
                  </div>
                </div>

                {/* PIN Input */}
                <div className="py-4">
                  <PinInput value={pin} onChange={setPin} />
                </div>

                {/* Security Tips */}
                <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-5 border border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{t('onboarding.steps.pin.securityTips')}</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      t('onboarding.steps.pin.tip1'),
                      t('onboarding.steps.pin.tip2'),
                      t('onboarding.steps.pin.tip3')
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div 
                key="confirm"
                className="space-y-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Icon & Title */}
                <div className="text-center space-y-4">
                  <motion.div 
                    className="relative inline-block"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 blur-2xl rounded-full scale-150" />
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto relative shadow-xl shadow-primary/25">
                      <Shield className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t('onboarding.steps.pin.confirmTitle')}</h2>
                    <p className="text-muted-foreground">
                      {t('onboarding.steps.pin.confirmSubtitle')}
                    </p>
                  </div>
                </div>

                {/* PIN Input */}
                <div className="py-4">
                  <PinInput value={confirmPin} onChange={setConfirmPin} />
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                className="space-y-8 text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div 
                  className="relative inline-block"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full scale-150" />
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto relative shadow-xl shadow-emerald-500/25">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                </motion.div>
                
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{t('onboarding.steps.pin.successTitle')}</h2>
                  <p className="text-muted-foreground">
                    {t('onboarding.steps.pin.successSubtitle')}
                  </p>
                </div>
                
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </OnboardingLayout>
  );
}
