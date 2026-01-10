import { OnboardingStepId } from './types/index';

export const ONBOARDING_CACHE_KEY = 'pryzen_onboarding_cache';
export const ONBOARDING_PROGRESS_KEY = 'pryzen_onboarding_progress';
export const ONBOARDING_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const ONBOARDING_STEP_ROUTES: Record<OnboardingStepId, string> = {
  welcome: '/onboarding',
  profile: '/onboarding/profile',
  'pin-setup': '/onboarding/pin-setup',
  deposit: '/onboarding/deposit',
  complete: '/onboarding/complete',
};

export const ONBOARDING_STEPS_ORDER: OnboardingStepId[] = [
  'welcome',
  'profile', 
  'pin-setup',
  'deposit',
  'complete'
];
