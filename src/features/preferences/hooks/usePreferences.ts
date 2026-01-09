import { useState, useEffect } from 'react';
import type { PreferencesState, UserPreferences } from '../types';
import { preferencesService } from '../services/preferencesService';

export const usePreferences = () => {
  const [state, setState] = useState<PreferencesState>({
    isLoading: false,
    preferences: null,
    error: null
  });

  const actions = {
    fetchPreferences: async (userId: string) => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const preferences = await preferencesService.fetchPreferences(userId);
        setState(prev => ({ ...prev, preferences, isLoading: false }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to fetch preferences', 
          isLoading: false 
        }));
      }
    },

    updatePreferences: async (preferences: Partial<UserPreferences>) => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const updatedPreferences = await preferencesService.updatePreferences(preferences);
        setState(prev => ({ ...prev, preferences: updatedPreferences, isLoading: false }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to update preferences', 
          isLoading: false 
        }));
      }
    }
  };

  return { state, actions };
};