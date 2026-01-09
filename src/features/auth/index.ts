// Auth feature public API - consolidated exports

// Context and hooks
export { AuthProvider, useAuth } from './contexts/AuthContext';

// Types (only public interfaces)
export type { 
  AuthUser, 
  AuthSession, 
  SignUpData, 
  SignInData, 
  UserType, 
  AuthContextType 
} from './types';

// Components
export { EnhancedLoginForm } from './components/EnhancedLoginForm';
export { SignupForm } from './components/SignupForm';
export { WalletConnectForm } from './components/WalletConnectForm';
export { ErrorDisplay } from './components/optimized/ErrorDisplay';

// Specialized hooks
export { useSignupForm } from './hooks/useSignupForm';
export { useAuthSession } from './hooks/useAuthSession';
export { useAuthActions } from './hooks/useAuthActions';
export { useValidationHook } from './hooks/useValidationHook';