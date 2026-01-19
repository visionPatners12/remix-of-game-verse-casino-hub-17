import React, { Suspense, useCallback, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useOnboardingSteps } from '../hooks/useOnboardingSteps';
import { OnboardingLoadingSkeleton } from '../components/OnboardingLoadingSkeleton';
import { logger } from '@/utils/logger';
import { lazyWithRetry } from '@/utils/lazyWithRetry';
import { getReferralCode } from '@/features/mlm/hooks/useReferralStorage';
import { useValidateReferralCode } from '@/features/mlm/hooks/useReferralCode';
import type { ReferrerInfo } from '../components/steps/InvitedByStep';

// Lazy load components with retry for better reliability
const InvitedByStep = lazyWithRetry(() => import('../components/steps/InvitedByStep').then(m => ({ default: m.InvitedByStep })));
const WelcomeStep = lazyWithRetry(() => import('../components/steps/WelcomeStep').then(m => ({ default: m.WelcomeStep })));
const ProfileStep = lazyWithRetry(() => import('../components/steps/ProfileStep').then(m => ({ default: m.ProfileStep })));
const PinSetupStep = lazyWithRetry(() => import('../components/steps/PinSetupStep').then(m => ({ default: m.PinSetupStep })));
const DepositStep = lazyWithRetry(() => import('../components/steps/DepositStep').then(m => ({ default: m.DepositStep })));
const CompleteStep = lazyWithRetry(() => import('../components/steps/CompleteStep').then(m => ({ default: m.CompleteStep })));

const INVITED_BY_SEEN_KEY = 'pryzen_invited_by_seen';

export function UnifiedOnboardingRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isLoading: isAuthLoading } = useAuth();
  const { goToNextStep, goToPreviousStep } = useOnboardingSteps();
  
  const [referrerInfo, setReferrerInfo] = useState<ReferrerInfo | null>(null);
  const [isCheckingReferral, setIsCheckingReferral] = useState(true);
  const validateReferralCode = useValidateReferralCode();

  // Check for referral code on mount
  useEffect(() => {
    const checkReferral = async () => {
      const code = getReferralCode();
      const alreadySeen = sessionStorage.getItem(INVITED_BY_SEEN_KEY);
      
      if (code && !alreadySeen) {
        try {
          const result = await validateReferralCode.mutateAsync(code);
          if (result.is_valid) {
            setReferrerInfo({
              username: result.referrer_username,
              firstName: result.referrer_first_name,
              lastName: result.referrer_last_name,
              avatarUrl: result.referrer_avatar_url,
            });
            // Redirect to invited-by if not already there
            if (!location.pathname.includes('invited-by')) {
              navigate('/onboarding/invited-by', { replace: true });
            }
          }
        } catch (error) {
          logger.error('Failed to validate referral code', { error });
        }
      }
      setIsCheckingReferral(false);
    };

    if (!isAuthLoading && session) {
      checkReferral();
    } else if (!isAuthLoading) {
      setIsCheckingReferral(false);
    }
  }, [isAuthLoading, session, location.pathname]);

  const handleInvitedByNext = useCallback(() => {
    // Mark as seen so we don't show again
    sessionStorage.setItem(INVITED_BY_SEEN_KEY, 'true');
    navigate('/onboarding', { replace: true });
  }, [navigate]);

  const handleNext = useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  const handleBack = useCallback(() => {
    goToPreviousStep();
  }, [goToPreviousStep]);

  const handleComplete = () => {
    // Set flag to trigger celebration on games page
    sessionStorage.setItem('onboarding_just_completed', 'true');
    navigate('/games');
  };

  // Wait for auth and referral check to fully load before rendering
  if (isAuthLoading || isCheckingReferral) {
    return <OnboardingLoadingSkeleton />;
  }

  // After loading, check if session exists
  if (!session) {
    logger.auth('No session in onboarding, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  return (
    <Suspense fallback={<OnboardingLoadingSkeleton />}>
      <Routes>
        <Route 
          path="/invited-by" 
          element={
            referrerInfo ? (
              <InvitedByStep 
                referrerInfo={referrerInfo} 
                onNext={handleInvitedByNext} 
              />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={<WelcomeStep onNext={handleNext} />} 
        />
        <Route 
          path="/profile" 
          element={<ProfileStep onNext={handleNext} onBack={handleBack} />} 
        />
        <Route 
          path="/pin-setup" 
          element={<PinSetupStep onNext={handleNext} onBack={handleBack} />} 
        />
        <Route 
          path="/deposit" 
          element={<DepositStep onNext={handleNext} onBack={handleBack} />} 
        />
        <Route
          path="/complete" 
          element={<CompleteStep onNext={handleComplete} onBack={handleBack} />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/onboarding" replace />} 
        />
      </Routes>
    </Suspense>
  );
}
