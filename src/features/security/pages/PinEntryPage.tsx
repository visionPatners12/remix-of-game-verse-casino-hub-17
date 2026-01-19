import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VirtualNumpad from '../components/VirtualNumpad';
import PinDots from '../components/PinDots';
import { usePinManagement } from '../hooks/usePinManagement';
import { usePinToken } from '@/hooks/usePinToken';
import { cn } from '@/lib/utils';

type PinMode = 'verify' | 'create' | 'confirm';

interface LocationState {
  mode?: PinMode;
  returnTo?: string;
  action?: string;
  onSuccessPath?: string;
}

const PIN_LENGTH = 6;
const MAX_ATTEMPTS = 3;

const PinEntryPage: React.FC = () => {
  const { t } = useTranslation('security');
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  
  const mode: PinMode = state?.mode || 'verify';
  const returnTo = state?.returnTo || '/';
  const onSuccessPath = state?.onSuccessPath;
  
  const { verifyPin, createPin, pinStatus } = usePinManagement();
  const { storeToken } = usePinToken();
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // Handle lock timer
  useEffect(() => {
    if (lockTimer > 0) {
      const interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockTimer]);

  const handleKeyPress = useCallback((key: string) => {
    if (isLocked || isLoading || success) return;
    
    setError(false);
    setErrorMessage('');
    
    if (step === 'enter' && pin.length < PIN_LENGTH) {
      setPin((prev) => prev + key);
    } else if (step === 'confirm' && confirmPin.length < PIN_LENGTH) {
      setConfirmPin((prev) => prev + key);
    }
  }, [pin, confirmPin, step, isLocked, isLoading, success]);

  const handleDelete = useCallback(() => {
    if (isLocked || isLoading || success) return;
    
    if (step === 'enter') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  }, [step, isLocked, isLoading, success]);

  const handleCancel = () => {
    navigate(returnTo, { replace: true });
  };

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (mode === 'verify') {
        const isValid = await verifyPin(pin);
        
        if (isValid) {
          setSuccess(true);
          // Generate a simple session token
          const sessionToken = `pin_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          storeToken(sessionToken, 5);
          
          setTimeout(() => {
            navigate(onSuccessPath || returnTo, { replace: true });
          }, 500);
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          
          if (newAttempts >= MAX_ATTEMPTS) {
            setIsLocked(true);
            setLockTimer(300); // 5 minutes
            setErrorMessage(t('pin.tooManyAttempts', { minutes: 5 }));
          } else {
            const remaining = MAX_ATTEMPTS - newAttempts;
            setErrorMessage(
              remaining === 1
                ? t('pin.incorrectPin', { count: remaining })
                : t('pin.incorrectPinPlural', { count: remaining })
            );
          }
          
          setError(true);
          setPin('');
        }
      } else if (mode === 'create') {
        if (step === 'enter') {
          setStep('confirm');
        } else {
          if (pin === confirmPin) {
            try {
              await createPin(pin);
              setSuccess(true);
              setTimeout(() => {
                navigate(onSuccessPath || returnTo, { replace: true });
              }, 500);
            } catch {
              setError(true);
              setErrorMessage(t('pin.errorSettingPin'));
              setConfirmPin('');
            }
          } else {
            setError(true);
            setErrorMessage(t('pin.pinsDoNotMatch'));
            setConfirmPin('');
          }
        }
      }
    } catch (err) {
      setError(true);
      setErrorMessage(t('pin.verificationError'));
      setPin('');
      setConfirmPin('');
    } finally {
      setIsLoading(false);
    }
  }, [mode, pin, confirmPin, step, attempts, isLoading, verifyPin, createPin, storeToken, navigate, returnTo, onSuccessPath, t]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    const currentPin = step === 'enter' ? pin : confirmPin;
    
    if (currentPin.length === PIN_LENGTH) {
      handleSubmit();
    }
  }, [pin, confirmPin, step, handleSubmit]);

  const getTitle = () => {
    if (mode === 'create') {
      return step === 'enter' ? t('pin.createPinTitle') : t('pin.confirmPinCode');
    }
    return t('pin.verification');
  };

  const getDescription = () => {
    if (mode === 'create') {
      return step === 'enter' ? t('pin.choosePinDescription') : t('pin.enterPinAgain');
    }
    return t('pin.verificationDescription');
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm text-muted-foreground font-medium">
          {t('pin.title')}
        </span>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            {/* Icon */}
            <motion.div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-6",
                success
                  ? "bg-green-500/20"
                  : isLocked
                    ? "bg-destructive/20"
                    : "bg-primary/10"
              )}
              animate={success ? { scale: [1, 1.1, 1] } : {}}
            >
              {success ? (
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              ) : isLocked ? (
                <Lock className="w-10 h-10 text-destructive" />
              ) : (
                <Shield className="w-10 h-10 text-primary" />
              )}
            </motion.div>

            {/* Title & Description */}
            <h1 className="text-xl font-semibold text-foreground mb-2">
              {getTitle()}
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-8">
              {getDescription()}
            </p>

            {/* PIN Dots */}
            <PinDots
              length={currentPin.length}
              maxLength={PIN_LENGTH}
              error={error}
              success={success}
              className="mb-4"
            />

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-destructive text-center mb-4"
                >
                  {errorMessage}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Lock Timer */}
            {isLocked && lockTimer > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground mb-4"
              >
                {t('pin.timeRemaining', { time: formatTime(lockTimer) })}
              </motion.p>
            )}

            {/* Step Indicator for Create Mode */}
            {mode === 'create' && (
              <div className="flex gap-2 mb-6">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    step === 'enter' ? "bg-primary" : "bg-muted"
                  )}
                />
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    step === 'confirm' ? "bg-primary" : "bg-muted"
                  )}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Virtual Numpad */}
      <div className="pb-8 bg-background">
        <VirtualNumpad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          disabled={isLocked || isLoading || success}
          showBiometric={false}
        />
        
        {/* Cancel Button */}
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-muted-foreground"
          >
            {t('pin.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PinEntryPage;
