import { useState } from 'react';
import { useUserProfile } from './useUserProfile';
import { ProfileFormData } from '@/features/profile/types';

export function useProfileSettings() {
  const { profile, updateProfile, isUpdating } = useUserProfile();
  const [usernameError, setUsernameError] = useState<string>('');

  const validateUsername = (username: string): string => {
    if (username.length < 3) {
      return 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    if (username.length > 20) {
      return 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores';
    }
    if (username.startsWith('_') || username.endsWith('_')) {
      return 'Le nom d\'utilisateur ne peut pas commencer ou finir par un underscore';
    }
    return '';
  };

  const handleUsernameChange = (value: string): string => {
    // Clean the input
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const error = validateUsername(cleanValue);
    setUsernameError(error);
    return cleanValue;
  };

  const updateSettings = async (formData: Partial<ProfileFormData>) => {
    try {
      await updateProfile(formData);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Error updating profile' 
      };
    }
  };

  return {
    profile,
    usernameError,
    isUpdating,
    validateUsername,
    handleUsernameChange,
    updateSettings,
  };
}