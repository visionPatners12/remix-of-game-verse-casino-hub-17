import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PinInput } from '../components/PinInput';
import { usePinManagement } from '../hooks/usePinManagement';
import { usePinSession } from '../hooks/usePinSession';
import { cn } from '@/lib/utils';

const REASON_LABELS: Record<string, string> = {
  withdraw: 'Confirmer le retrait',
  settings: 'Modifier les paramètres',
  transaction: 'Confirmer la transaction',
  security: 'Accéder aux paramètres de sécurité',
  default: 'Vérification requise',
};

export const PinChallengePage: React.FC = () => {
  const { t } = useTranslation('security');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const redirect = searchParams.get('redirect') || '/';
  const reason = searchParams.get('reason') || 'default';
  
  const { verifyPin, pinStatus, isLoading, isVerifying } = usePinManagement();
  const { createPinSession, isPinSessionValid } = usePinSession();
  
  const isLoadingStatus = isLoading;
  
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 5 * 60; // 5 minutes in seconds

  // If session is already valid, redirect immediately
  useEffect(() => {
    if (isPinSessionValid()) {
      navigate(redirect, { replace: true });
    }
  }, [isPinSessionValid, navigate, redirect]);

  // Check if user has PIN set up
  useEffect(() => {
    if (!isLoadingStatus && pinStatus) {
      if (!pinStatus.hasPin || !pinStatus.isEnabled) {
        // No PIN set up, redirect to PIN setup
        navigate('/settings/pin?setup=required&redirect=' + encodeURIComponent(redirect), { replace: true });
      }
      // Check if already locked from backend
      if (pinStatus.isLocked && pinStatus.lockedUntil) {
        const lockEnd = new Date(pinStatus.lockedUntil).getTime();
        const remaining = Math.max(0, Math.floor((lockEnd - Date.now()) / 1000));
        if (remaining > 0) {
          setIsLocked(true);
          setLockTimeLeft(remaining);
        }
      }
    }
  }, [pinStatus, isLoadingStatus, navigate, redirect]);

  // Lockout countdown
  useEffect(() => {
    if (lockTimeLeft > 0) {
      const timer = setTimeout(() => setLockTimeLeft((prev) => prev - 1), 1000);
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

    setError('');
    
    try {
      const isValid = await verifyPin(pinValue);
      
      if (isValid) {
        // Success - create session and redirect
        createPinSession();
        navigate(redirect, { replace: true });
      } else {
        // Invalid PIN
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setLockTimeLeft(LOCKOUT_DURATION);
          setError(`Trop de tentatives. Réessayez dans ${Math.ceil(LOCKOUT_DURATION / 60)} minutes.`);
        } else {
          const remaining = MAX_ATTEMPTS - newAttempts;
          setError(
            remaining > 1
              ? `PIN incorrect. ${remaining} tentatives restantes.`
              : `PIN incorrect. Dernière tentative.`
          );
        }
      }
    } catch (err) {
      setPin('');
      setError(err instanceof Error ? err.message : 'Erreur de vérification');
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

  const handleCancel = () => {
    navigate(-1);
  };

  const reasonLabel = REASON_LABELS[reason] || REASON_LABELS.default;
  const isDisabled = isLocked || isVerifying;

  if (isLoadingStatus) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Sécurité</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-safe">
        <div className="w-full max-w-sm space-y-8 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-full',
                isLocked
                  ? 'bg-destructive/10'
                  : 'bg-primary/10'
              )}
            >
              {isLocked ? (
                <Lock className="h-10 w-10 text-destructive" />
              ) : (
                <Shield className="h-10 w-10 text-primary" />
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {isLocked ? 'Compte verrouillé' : 'Entrez votre PIN'}
            </h2>
            <p className="text-muted-foreground">
              {isLocked
                ? `Trop de tentatives. Réessayez dans ${formatTime(lockTimeLeft)}.`
                : reasonLabel}
            </p>
          </div>

          {/* PIN Input */}
          {!isLocked && (
            <div className="flex justify-center py-4">
              <PinInput
                value={pin}
                onChange={handlePinChange}
                onComplete={handlePinComplete}
                disabled={isDisabled}
                error={!!error}
              />
            </div>
          )}

          {/* Lockout Timer */}
          {isLocked && (
            <div className="py-8">
              <div className="text-4xl font-mono font-bold text-destructive">
                {formatTime(lockTimeLeft)}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !isLocked && (
            <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}

          {/* Loading indicator */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Vérification...</span>
            </div>
          )}

          {/* Cancel Button */}
          <div className="pt-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-muted-foreground"
            >
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
