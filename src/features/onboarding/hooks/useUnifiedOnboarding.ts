import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { logger } from '@/utils/logger';
import { OnboardingState, OnboardingStep } from '../types';

/**
 * Simplified KISS onboarding hook - no cache, just direct Supabase fetch
 */
export const useUnifiedOnboarding = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    onboardingCompleted: null,
    isOnboardingLoading: true,
    onboardingProgress: null,
  });

  // Simple direct fetch from database
  const checkOnboardingStatus = useCallback(async () => {
    if (!user?.id) {
      setState({ 
        onboardingCompleted: null, 
        isOnboardingLoading: false,
        onboardingProgress: null,
      });
      return;
    }

    try {
      logger.debug('useUnifiedOnboarding: Fetching status from database for user:', user.id);
      const { data, error } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('useUnifiedOnboarding: Database error:', error);
        throw error;
      }

      const completed = data?.onboarding_completed ?? false;
      logger.debug('useUnifiedOnboarding: Status fetched:', { completed });
      
      setState({ 
        onboardingCompleted: completed, 
        isOnboardingLoading: false,
        onboardingProgress: null,
      });
    } catch (error) {
      logger.warn('useUnifiedOnboarding: Failed to fetch status:', error);
      setState({ 
        onboardingCompleted: false, 
        isOnboardingLoading: false,
        onboardingProgress: null,
      });
    }
  }, [user?.id]);

  // Update onboarding status
  const updateOnboardingStatus = useCallback(async (completed: boolean) => {
    if (!user?.id) return;

    try {
      logger.debug('useUnifiedOnboarding: Updating status:', { completed, userId: user.id });
      
      // Optimistic update
      setState(prev => ({ ...prev, onboardingCompleted: completed }));

      const { error } = await supabase
        .from('users')
        .update({ onboarding_completed: completed })
        .eq('id', user.id);

      if (error) {
        logger.error('useUnifiedOnboarding: Failed to update database:', error);
        // Revert on error
        setState(prev => ({ ...prev, onboardingCompleted: !completed }));
        throw error;
      }

      logger.debug('useUnifiedOnboarding: Status updated successfully');
    } catch (error) {
      logger.error('useUnifiedOnboarding: Update failed:', error);
      throw error;
    }
  }, [user?.id]);

  // Progress management (kept simple in localStorage for UI state only)
  const setOnboardingProgress = useCallback((step: OnboardingStep['step']) => {
    if (!user?.id) return;
    
    const progress: OnboardingStep = {
      step,
      completedAt: new Date(),
      id: step,
      title: step,
    };
    setState(prev => ({ ...prev, onboardingProgress: progress }));
  }, [user?.id]);

  // Initialize onboarding check when user changes
  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return {
    // State
    onboardingCompleted: state.onboardingCompleted,
    isOnboardingLoading: state.isOnboardingLoading,
    onboardingProgress: state.onboardingProgress,
    
    // Actions
    updateOnboardingStatus,
    checkOnboardingStatus,
    setOnboardingProgress,
    
    // Helpers
    isOnboardingRequired: user !== null && state.onboardingCompleted === false,
  };
};
