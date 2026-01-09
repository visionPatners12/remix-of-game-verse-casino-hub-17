import { logger } from '@/utils/logger';
import { AuthError } from '../types';

/**
 * Parse authentication errors into user-friendly messages
 */
export function parseAuthError(error: AuthError): string {
  logger.debug('AuthHelpers: Parsing error:', error);
  
  // Handle weak password errors
  if (error.message?.includes('Password is too weak') || error.message?.includes('weak_password')) {
    const reasons = error.weak_password?.reasons || [];
    const isCompromised = reasons.includes('pwned');
    
    return isCompromised 
      ? 'This password has been compromised in data breaches. Choose a different password.'
      : 'Your password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and symbols.';
  }
  
  // Handle common auth errors
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Incorrect email or password';
    case 'User already registered':
      return 'An account already exists with this email address';
    case 'Email not confirmed':
      return 'Please confirm your email before signing in';
    default:
      return error.message || 'An error occurred';
  }
}