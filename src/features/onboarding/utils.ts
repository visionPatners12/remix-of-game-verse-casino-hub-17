import { OnboardingStepId } from './types/index';
import { ONBOARDING_STEPS_ORDER, ONBOARDING_STEP_ROUTES } from './constants';

export const getNextStep = (currentStep: OnboardingStepId): OnboardingStepId | null => {
  const currentIndex = ONBOARDING_STEPS_ORDER.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEPS_ORDER.length - 1) {
    return null;
  }
  return ONBOARDING_STEPS_ORDER[currentIndex + 1];
};

export const getPreviousStep = (currentStep: OnboardingStepId): OnboardingStepId | null => {
  const currentIndex = ONBOARDING_STEPS_ORDER.indexOf(currentStep);
  if (currentIndex <= 0) {
    return null;
  }
  return ONBOARDING_STEPS_ORDER[currentIndex - 1];
};

export const getStepRoute = (stepId: OnboardingStepId): string => {
  return ONBOARDING_STEP_ROUTES[stepId];
};

export const getStepFromRoute = (route: string): OnboardingStepId => {
  const entry = Object.entries(ONBOARDING_STEP_ROUTES).find(([_, path]) => path === route);
  return (entry?.[0] as OnboardingStepId) || 'welcome';
};