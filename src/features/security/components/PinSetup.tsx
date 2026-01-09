import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PinInput } from './PinInput';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinSetupProps {
  mode: 'create' | 'change';
  onComplete: (pin: string) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const PinSetup: React.FC<PinSetupProps> = ({
  mode,
  onComplete,
  onCancel,
  isLoading = false,
  className
}) => {
  const { t } = useTranslation('security');
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>(() => 
    mode === 'change' ? 'current' : 'new'
  );
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [currentPinError, setCurrentPinError] = useState(false);

  const resetError = () => {
    setError('');
    setCurrentPinError(false);
  };

  const handleCurrentPinComplete = async (pin: string) => {
    setCurrentPin(pin);
    // TODO: Verify current PIN with backend
    // For now, simulate success
    setTimeout(() => {
      setStep('new');
      resetError();
    }, 500);
  };

  const handleNewPinComplete = (pin: string) => {
    setNewPin(pin);
    setStep('confirm');
    resetError();
  };

  const handleConfirmPinComplete = async (pin: string) => {
    setConfirmPin(pin);
    
    if (pin !== newPin) {
      setError(t('pin.pinsDoNotMatch'));
      setConfirmPin('');
      return;
    }

    try {
      await onComplete(pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pin.errorSettingPin'));
      setConfirmPin('');
    }
  };

  const handleBack = () => {
    resetError();
    if (step === 'confirm') {
      setStep('new');
      setConfirmPin('');
    } else if (step === 'new' && mode === 'change') {
      setStep('current');
      setNewPin('');
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 'current':
        return {
          title: t('pin.currentPinCode'),
          description: t('pin.enterCurrentPin'),
          value: currentPin,
          onChange: setCurrentPin,
          onComplete: handleCurrentPinComplete,
          error: currentPinError
        };
      case 'new':
        return {
          title: mode === 'create' ? t('pin.createPinTitle') : t('pin.newPinCode'),
          description: t('pin.choosePinDescription'),
          value: newPin,
          onChange: setNewPin,
          onComplete: handleNewPinComplete,
          error: false
        };
      case 'confirm':
        return {
          title: t('pin.confirmPinCode'),
          description: t('pin.enterPinAgain'),
          value: confirmPin,
          onChange: setConfirmPin,
          onComplete: handleConfirmPinComplete,
          error: !!error
        };
    }
  };

  const stepContent = getStepContent();
  const progress = mode === 'create' 
    ? (step === 'new' ? 50 : 100)
    : (step === 'current' ? 33 : step === 'new' ? 66 : 100);

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {step === 'confirm' && newPin === confirmPin && confirmPin.length === 6 && (
            <CheckCircle className="h-5 w-5 text-success" />
          )}
          {stepContent.title}
        </CardTitle>
        <CardDescription>{stepContent.description}</CardDescription>
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-1.5 mt-4">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <PinInput
            value={stepContent.value}
            onChange={stepContent.onChange}
            onComplete={stepContent.onComplete}
            disabled={isLoading}
            error={stepContent.error}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          {/* Show back button for confirm step or when we're not on the first step */}
          {(step === 'confirm' || (step === 'new' && mode === 'change')) && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1"
            >
              {t('pin.back')}
            </Button>
          )}
          
          {/* Show cancel button for first step of create mode or current step of change mode */}
          {((step === 'new' && mode === 'create') || (step === 'current' && mode === 'change')) && onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              {t('pin.cancel')}
            </Button>
          )}
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2">
          {mode === 'change' && (
            <div className={cn(
              "h-2 w-2 rounded-full transition-colors",
              step === 'current' ? 'bg-primary' : 'bg-muted'
            )} />
          )}
          <div className={cn(
            "h-2 w-2 rounded-full transition-colors",
            step === 'new' ? 'bg-primary' : step === 'confirm' ? 'bg-muted' : 'bg-muted'
          )} />
          <div className={cn(
            "h-2 w-2 rounded-full transition-colors",
            step === 'confirm' ? 'bg-primary' : 'bg-muted'
          )} />
        </div>
      </CardContent>
    </Card>
  );
};
