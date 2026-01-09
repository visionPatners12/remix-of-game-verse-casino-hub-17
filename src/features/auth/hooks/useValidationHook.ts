import { useState, useCallback, useRef } from 'react';
import { validateSignupData, ValidationError } from '@/utils/signupValidation';
import { SignUpData } from '@/types';

interface ValidationCache {
  [key: string]: {
    result: ValidationError[];
    timestamp: number;
  };
}

/**
 * Optimized validation hook with debouncing and caching
 */
export function useValidationHook() {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const cacheRef = useRef<ValidationCache>({});
  const debounceRef = useRef<NodeJS.Timeout>();
  
  // Cache TTL: 30 seconds
  const CACHE_TTL = 30000;

  const validateWithCache = useCallback((data: SignUpData) => {
    const cacheKey = JSON.stringify({
      email: data.email,
      password: data.password,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      country: data.country
    });

    // Check cache first
    const cached = cacheRef.current[cacheKey];
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      setValidationErrors(cached.result);
      return cached.result;
    }

    // Perform validation
    const validation = validateSignupData(data);
    const errors = validation.isValid ? [] : validation.errors;

    // Update cache
    cacheRef.current[cacheKey] = {
      result: errors,
      timestamp: now
    };

    // Clean old cache entries (keep cache size manageable)
    Object.keys(cacheRef.current).forEach(key => {
      if ((now - cacheRef.current[key].timestamp) > CACHE_TTL) {
        delete cacheRef.current[key];
      }
    });

    setValidationErrors(errors);
    return errors;
  }, []);

  const debouncedValidate = useCallback((data: SignUpData, delay: number = 300) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      validateWithCache(data);
    }, delay);
  }, [validateWithCache]);

  const clearValidation = useCallback(() => {
    setValidationErrors([]);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    validationErrors,
    validateWithCache,
    debouncedValidate,
    clearValidation
  };
}
