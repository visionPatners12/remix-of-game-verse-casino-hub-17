import { OnboardingStepId } from '../types';

/**
 * Navigation utilities for onboarding flow
 */

export const ONBOARDING_STEPS: OnboardingStepId[] = [
  'welcome',
  'profile', 
  'pin-setup',
  'favorite-sport',
  'favorite-leagues',
  'favorite-team',
  'deposit',
  'complete'
];

export const getStepIndex = (step: OnboardingStepId): number => {
  return ONBOARDING_STEPS.indexOf(step);
};

export const getStepById = (index: number): OnboardingStepId | null => {
  return ONBOARDING_STEPS[index] || null;
};

export const getNextStep = (currentStep: OnboardingStepId): OnboardingStepId | null => {
  const currentIndex = getStepIndex(currentStep);
  return getStepById(currentIndex + 1);
};

export const getPreviousStep = (currentStep: OnboardingStepId): OnboardingStepId | null => {
  const currentIndex = getStepIndex(currentStep);
  return getStepById(currentIndex - 1);
};

export const getStepPath = (step: OnboardingStepId): string => {
  return step === 'welcome' ? '/onboarding' : `/onboarding/${step}`;
};

export const isFirstStep = (step: OnboardingStepId): boolean => {
  return getStepIndex(step) === 0;
};

export const isLastStep = (step: OnboardingStepId): boolean => {
  return getStepIndex(step) === ONBOARDING_STEPS.length - 1;
};

export const getProgressPercentage = (step: OnboardingStepId): number => {
  const index = getStepIndex(step);
  return Math.round(((index + 1) / ONBOARDING_STEPS.length) * 100);
};