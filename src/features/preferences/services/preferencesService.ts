import type { UserPreferences } from '../types';

export const preferencesService = {
  fetchPreferences: async (userId: string): Promise<UserPreferences> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          userId,
          displaySettings: {
            theme: 'system',
            language: 'en',
            fontSize: 'medium',
            highContrast: false
          },
          appSettings: {
            notifications: true,
            pushNotifications: true,
            emailNotifications: false,
            soundEnabled: true,
            autoLogin: false,
            biometricAuth: false
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }, 500);
    });
  },

  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          userId: preferences.userId || '',
          displaySettings: preferences.displaySettings || {
            theme: 'system',
            language: 'en',
            fontSize: 'medium',
            highContrast: false
          },
          appSettings: preferences.appSettings || {
            notifications: true,
            pushNotifications: true,
            emailNotifications: false,
            soundEnabled: true,
            autoLogin: false,
            biometricAuth: false
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }, 500);
    });
  }
};