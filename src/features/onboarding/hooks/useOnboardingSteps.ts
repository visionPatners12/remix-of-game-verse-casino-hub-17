import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OnboardingStepId } from '../types/index';
import { getNextStep, getPreviousStep, getStepRoute, getStepFromRoute } from '../utils';

export const useOnboardingSteps = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentStepId = getStepFromRoute(location.pathname);

  const goToStep = useCallback((stepId: OnboardingStepId) => {
    const route = getStepRoute(stepId);
    navigate(route);
  }, [navigate]);

  const goToNextStep = useCallback(() => {
    const nextStep = getNextStep(currentStepId);
    if (nextStep) {
      goToStep(nextStep);
    }
  }, [currentStepId, goToStep]);

  const goToPreviousStep = useCallback(() => {
    const previousStep = getPreviousStep(currentStepId);
    if (previousStep) {
      goToStep(previousStep);
    }
  }, [currentStepId, goToStep]);

  const canGoNext = getNextStep(currentStepId) !== null;
  const canGoBack = getPreviousStep(currentStepId) !== null;

  return {
    currentStepId,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoBack,
  };
};