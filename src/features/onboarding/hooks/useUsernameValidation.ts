import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/features/profile/hooks';

/**
 * Optimized username validation hook with debouncing and caching
 */
export const useUsernameValidation = () => {
  const { profile } = useUserProfile();
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [lastCheckedUsername, setLastCheckedUsername] = useState<string>('');

  // Simple in-memory cache for username checks
  const usernameCache = new Map<string, boolean>();

  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setIsAvailable(null);
      return;
    }

    // Check if it's the current user's username
    if (username === profile?.username) {
      setIsAvailable(true);
      return;
    }

    // Check cache first
    if (usernameCache.has(username)) {
      setIsAvailable(usernameCache.get(username)!);
      return;
    }

    // Avoid duplicate requests
    if (username === lastCheckedUsername && isChecking) {
      return;
    }

    setLastCheckedUsername(username);
    setIsChecking(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      const available = !data;
      
      // Cache the result
      usernameCache.set(username, available);
      
      // Limit cache size
      if (usernameCache.size > 50) {
        const firstKey = usernameCache.keys().next().value;
        usernameCache.delete(firstKey);
      }

      setIsAvailable(available);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
        // Username available
        const available = true;
        usernameCache.set(username, available);
        setIsAvailable(available);
      } else {
        console.error('Error checking username:', error);
        setIsAvailable(null);
      }
    } finally {
      setIsChecking(false);
    }
  }, [profile?.username, lastCheckedUsername, isChecking]);

  // Debounced version of the check function
  const debouncedCheck = useCallback((username: string) => {
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [checkUsernameAvailability]);

  // Reset state when needed
  const resetValidation = useCallback(() => {
    setIsAvailable(null);
    setIsChecking(false);
    setLastCheckedUsername('');
  }, []);

  return {
    isChecking,
    isAvailable,
    checkUsernameAvailability: debouncedCheck,
    resetValidation,
  };
};