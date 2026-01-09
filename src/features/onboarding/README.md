# Onboarding Feature

A comprehensive onboarding flow for new users, supporting both traditional and wallet-based authentication.

## Overview

The onboarding feature guides users through essential setup steps:
- Welcome & Introduction
- Profile Setup
- PIN Configuration  
- Sports Preferences (Sport → Leagues → Team)
- Completion

## Architecture

```
src/features/onboarding/
├── components/           # React components
│   ├── steps/           # Step-specific components
│   ├── sms/            # SMS verification components
│   └── index.ts        # Component exports
├── hooks/              # Custom hooks
│   ├── useOnboarding.ts        # Main onboarding state
│   └── useOnboardingSteps.ts   # Step navigation
├── pages/              # Route components
│   └── OnboardingRouter.tsx    # Main router
├── services/           # Business logic
│   ├── onboardingService.ts    # API calls
│   └── cacheService.ts         # Cache management
├── types/              # TypeScript definitions
├── utils/              # Utilities and helpers
├── constants.ts        # Configuration constants
└── index.ts           # Public exports
```

## Usage

### Basic Setup

```tsx
import { OnboardingRouter, useOnboarding } from '@/features/onboarding';

function App() {
  return (
    <Routes>
      <Route path="/onboarding/*" element={<OnboardingRouter />} />
    </Routes>
  );
}
```

### Checking Onboarding Status

```tsx
import { useOnboarding } from '@/features/onboarding';

function MyComponent() {
  const { 
    onboardingCompleted, 
    isOnboardingLoading,
    checkOnboardingStatus 
  } = useOnboarding();

  if (isOnboardingLoading) return <Loading />;
  if (!onboardingCompleted) return <Navigate to="/onboarding" />;
  
  return <Dashboard />;
}
```

### Step Navigation

```tsx
import { useOnboardingSteps } from '@/features/onboarding';

function CustomStep() {
  const { 
    currentStepId, 
    goToNextStep, 
    goToPreviousStep,
    canGoNext,
    canGoBack 
  } = useOnboardingSteps();

  return (
    <div>
      <h2>Current Step: {currentStepId}</h2>
      {canGoBack && (
        <button onClick={goToPreviousStep}>Back</button>
      )}
      {canGoNext && (
        <button onClick={goToNextStep}>Next</button>
      )}
    </div>
  );
}
```

## API Integration

The feature integrates with Supabase for:
- User profile management
- Onboarding progress tracking
- Sports preferences storage

## Caching Strategy

- **Status Cache**: 5-minute cache for onboarding completion status
- **Progress Cache**: Local storage for current step tracking
- **Automatic Invalidation**: Cache clears on completion or errors

## Step Configuration

Add new steps by updating:
1. `OnboardingStepId` type in `types/index.ts`
2. `ONBOARDING_STEPS_ORDER` in `constants.ts`  
3. `ONBOARDING_STEP_ROUTES` in `constants.ts`
4. Route in `OnboardingRouter.tsx`
5. Step component in `components/steps/`

## Testing

```bash
# Unit tests
npm test src/features/onboarding

# Integration tests  
npm test src/features/onboarding/integration
```