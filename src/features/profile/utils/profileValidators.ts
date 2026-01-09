import { ProfileFormData } from '@/features/profile/types';

export const profileValidators = {
  validateProfileForm(data: Partial<ProfileFormData>): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Username validation
    if (data.username) {
      if (data.username.length < 3) {
        errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
      } else if (data.username.length > 20) {
        errors.username = 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères';
      } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        errors.username = 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores';
      } else if (data.username.startsWith('_') || data.username.endsWith('_')) {
        errors.username = 'Le nom d\'utilisateur ne peut pas commencer ou finir par un underscore';
      }
    }

    // Email validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Adresse email invalide';
      }
    }

    // Phone validation
    if (data.phone) {
      const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
      if (!phoneRegex.test(data.phone)) {
        errors.phone = 'Numéro de téléphone invalide';
      }
    }

    // Bio validation
    if (data.bio && data.bio.length > 160) {
      errors.bio = 'La bio ne peut pas dépasser 160 caractères';
    }

    // First name validation
    if (data.first_name && data.first_name.length > 50) {
      errors.first_name = 'Le prénom ne peut pas dépasser 50 caractères';
    }

    // Last name validation
    if (data.last_name && data.last_name.length > 50) {
      errors.last_name = 'Le nom ne peut pas dépasser 50 caractères';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  sanitizeInput(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  },

  sanitizeUsername(username: string): string {
    return username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  }
};