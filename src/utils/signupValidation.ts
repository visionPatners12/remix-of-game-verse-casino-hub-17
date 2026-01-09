
import { SignUpData } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateSignupData = (data: SignUpData): ValidationResult => {
  
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'L\'email est requis' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Format d\'email invalide' });
  }

  if (!data.password?.trim()) {
    errors.push({ field: 'password', message: 'Le mot de passe est requis' });
  } else if (data.password.length < 8) {
    errors.push({ field: 'password', message: 'Le mot de passe doit contenir au moins 8 caractères' });
  }

  if (!data.username?.trim()) {
    errors.push({ field: 'username', message: 'Le nom d\'utilisateur est requis' });
  } else if (data.username.length < 3) {
    errors.push({ field: 'username', message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' });
  }

  if (!data.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'Le prénom est requis' });
  }

  if (!data.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Le nom est requis' });
  }

  if (!data.dateOfBirth) {
    errors.push({ field: 'dateOfBirth', message: 'La date de naissance est requise' });
  } else {
    // Check minimum age (13 years)
    const today = new Date();
    const minAge = 13;
    const minDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    
    if (data.dateOfBirth > minDate) {
      errors.push({ field: 'dateOfBirth', message: 'Vous devez avoir au moins 13 ans' });
    }
  }

  return { isValid: errors.length === 0, errors };
};
