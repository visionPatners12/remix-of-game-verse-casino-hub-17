export interface OnboardingState {
  onboardingCompleted: boolean | null;
  isOnboardingLoading: boolean;
  onboardingProgress: OnboardingStep | null;
}

export interface OnboardingStep {
  step: string;
  completedAt: Date;
  id: string;
  title: string;
}

export interface OnboardingStepProps {
  onNext?: () => void;
  onBack?: () => void;
  currentStep?: string;
}

export type OnboardingStepId = 
  | 'welcome' 
  | 'profile' 
  | 'pin-setup' 
  | 'deposit'
  | 'complete';

// Re-export SMS types
export * from './sms';
