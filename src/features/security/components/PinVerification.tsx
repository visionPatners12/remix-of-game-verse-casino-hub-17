import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PinInput } from './PinInput';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui';
import { Shield, AlertCircle, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinVerificationProps {
  title?: string;
  description?: string;
  onVerify: (pin: string) => Promise<boolean>;
  onCancel?: () => void;
  maxAttempts?: number;
  lockoutDuration?: number; // in minutes
  className?: string;
}

export const PinVerification: React.FC<PinVerificationProps> = ({
  title,
  description,
  onVerify,
  onCancel,
  maxAttempts = 3,
  lockoutDuration = 5,
  className
}) => {
  const { t } = useTranslation('security');
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const displayTitle = title || t('pin.verification');
  const displayDescription = description || t('pin.verificationDescription');

  // Timer for lockout countdown
  useEffect(() => {
    if (lockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setLockTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockTimeLeft === 0) {
      setIsLocked(false);
      setAttempts(0);
      setError('');
    }
  }, [lockTimeLeft, isLocked]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePinComplete = async (pinValue: string) => {
    if (isLocked || isVerifying) return;

    setIsVerifying(true);
    setError('');
    
    try {
      const isValid = await onVerify(pinValue);
      
      if (isValid) {
        // Success - PIN is correct
        setPin('');
        setAttempts(0);
        setError('');
      } else {
        // Invalid PIN
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');
        
        if (newAttempts >= maxAttempts) {
          // Lock the user out
          setIsLocked(true);
          setLockTimeLeft(lockoutDuration * 60);
          setError(t('pin.tooManyAttempts', { minutes: lockoutDuration }));
        } else {
          const remainingAttempts = maxAttempts - newAttempts;
          setError(remainingAttempts > 1 
            ? t('pin.incorrectPinPlural', { count: remainingAttempts })
            : t('pin.incorrectPin', { count: remainingAttempts })
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pin.verificationError'));
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinChange = (value: string) => {
    if (!isLocked) {
      setPin(value);
      if (error && !isLocked) {
        setError('');
      }
    }
  };

  const isDisabled = isLocked || isVerifying;
  const showError = error && !isVerifying;

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className={cn(
            "h-5 w-5",
            isLocked ? "text-destructive" : "text-primary"
          )} />
          {displayTitle}
        </CardTitle>
        <CardDescription>{displayDescription}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <PinInput
            value={pin}
            onChange={handlePinChange}
            onComplete={handlePinComplete}
            disabled={isDisabled}
            error={!!error && !isLocked}
          />
        </div>

        {showError && (
          <div className={cn(
            "flex items-start gap-2 text-sm p-3 rounded-lg",
            isLocked 
              ? "text-destructive bg-destructive/10" 
              : "text-destructive bg-destructive/10"
          )}>
            {isLocked ? (
              <Timer className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p>{error}</p>
              {isLocked && lockTimeLeft > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('pin.timeRemaining', { time: formatTime(lockTimeLeft) })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Attempts indicator */}
        {attempts > 0 && !isLocked && (
          <div className="flex justify-center gap-1">
            {Array.from({ length: maxAttempts }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full",
                  i < attempts ? "bg-destructive" : "bg-muted"
                )}
              />
            ))}
          </div>
        )}

        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isVerifying}
            className="w-full"
          >
            {t('pin.cancel')}
          </Button>
        )}

        {isVerifying && (
          <div className="text-center text-sm text-muted-foreground">
            {t('pin.verifying')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
