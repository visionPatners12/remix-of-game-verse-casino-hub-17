import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useOnboardingSteps } from '../hooks/useOnboardingSteps';
import { OnboardingLoadingSkeleton } from '../components/OnboardingLoadingSkeleton';
import { logger } from '@/utils/logger';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

// Lazy load components with retry for better reliability
const WelcomeStep = lazyWithRetry(() => import('../components/steps/WelcomeStep').then(m => ({ default: m.WelcomeStep })));
const ProfileStep = lazyWithRetry(() => import('../components/steps/ProfileStep').then(m => ({ default: m.ProfileStep })));
const PinSetupStep = lazyWithRetry(() => import('../components/steps/PinSetupStep').then(m => ({ default: m.PinSetupStep })));
const FavoriteSportStep = lazyWithRetry(() => import('../components/steps/FavoriteSportStep').then(m => ({ default: m.FavoriteSportStep })));
const FavoriteLeaguesStep = lazyWithRetry(() => import('../components/steps/FavoriteLeaguesStep').then(m => ({ default: m.FavoriteLeaguesStep })));
const FavoriteTeamStep = lazyWithRetry(() => import('../components/steps/FavoriteTeamStep').then(m => ({ default: m.FavoriteTeamStep })));
const DepositStep = lazyWithRetry(() => import('../components/steps/DepositStep').then(m => ({ default: m.DepositStep })));
const CompleteStep = lazyWithRetry(() => import('../components/steps/CompleteStep').then(m => ({ default: m.CompleteStep })));

export function UnifiedOnboardingRouter() {
  const navigate = useNavigate();
  const { session, isLoading: isAuthLoading } = useAuth();
  const { goToNextStep, goToPreviousStep } = useOnboardingSteps();

  const handleNext = () => {
    goToNextStep();
  };

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleComplete = () => {
    // Set flag to trigger celebration on dashboard
    sessionStorage.setItem('onboarding_just_completed', 'true');
    navigate('/dashboard');
  };

  // Wait for auth to fully load before rendering
  if (isAuthLoading) {
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
          path="/favorite-sport" 
          element={<FavoriteSportStep onNext={handleNext} onBack={handleBack} />} 
        />
        <Route 
          path="/favorite-leagues" 
          element={<FavoriteLeaguesStep onNext={handleNext} onBack={handleBack} />} 
        />
        <Route 
          path="/favorite-team" 
          element={<FavoriteTeamStep onNext={handleNext} onBack={handleBack} />} 
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