import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SignUpData } from '@/types';
import { useAuth } from '@/features/auth';
import { useValidationHook } from './useValidationHook';
import { logger } from '@/utils/logger';

interface AuthError {
  code: string;
  message: string;
  isWeakPassword?: boolean;
  isCompromised?: boolean;
  reasons?: string[];
}

/**
 * Signup form hook - simplified state management
 */
export const useSignupForm = () => {
  // Simplified state with individual useState hooks
  const [userData, setUserData] = useState<SignUpData>({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    phoneVerified: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { validationErrors, validateWithCache, clearValidation } = useValidationHook();

  // Optimized change handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear errors when user starts typing
    if (validationErrors.length > 0 || authError) {
      clearValidation();
      setAuthError(null);
    }
    
    setUserData(prev => ({ ...prev, [name]: value }));
  }, [validationErrors.length, authError, clearValidation]);

  const handleCountryChange = useCallback((country: string) => {
    setUserData(prev => ({ ...prev, country, phone: '' }));
  }, []);

  const handlePhoneChange = useCallback((phone: string) => {
    setUserData(prev => ({ ...prev, phone }));
  }, []);

  const handleDateChange = useCallback((dateOfBirth: Date | undefined) => {
    setUserData(prev => ({ ...prev, dateOfBirth }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    logger.auth('Starting optimized signup process');
    
    // Clear previous errors
    clearValidation();
    setAuthError(null);
    
    // Validate terms and privacy
    if (!termsAccepted || !privacyAccepted) {
      toast.error('You must accept the terms of use and privacy policy');
      return;
    }

    // Validate form data with cache
    const errors = validateWithCache(userData);
    if (errors.length > 0) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(userData);
      logger.auth('Signup successful, redirecting');
      toast.success('Account created successfully! Check your email for activation.');
      
      navigate(`/token-confirmation?email=${encodeURIComponent(userData.email)}`);
    } catch (error) {
      logger.error('Signup failed:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      
      const authError: AuthError = {
        code: 'signup_error',
        message,
      };
      
      setAuthError(authError);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [userData, termsAccepted, privacyAccepted, validateWithCache, clearValidation, signUp, navigate]);

  // Optimized password error derivation
  const passwordError = authError?.isWeakPassword ? {
    isWeak: true,
    isCompromised: authError.isCompromised || false,
    reasons: authError.reasons || []
  } : null;

  return {
    userData,
    isLoading,
    termsAccepted,
    privacyAccepted,
    validationErrors,
    authError,
    passwordError,
    handleChange,
    handleCountryChange,
    handlePhoneChange,
    handleDateChange,
    handleSubmit,
    setTermsAccepted,
    setPrivacyAccepted,
  };
};