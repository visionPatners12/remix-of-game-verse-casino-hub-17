import type { PostType, PostCreationState } from '../types/creation';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePostContent = (content: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!content.trim()) {
    errors.push('Content cannot be empty');
  }
  
  if (content.length > 2000) {
    errors.push('Content cannot exceed 2000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePostSubmission = (state: PostCreationState): ValidationResult => {
  const errors: string[] = [];
  
  // Content validation
  const contentValidation = validatePostContent(state.content);
  errors.push(...contentValidation.errors);
  
  // Type-specific validation
  switch (state.selectedType) {
    case 'prediction':
      if (!state.selectedPrediction) {
        errors.push('Please select a market for your prediction');
      }
      if (state.confidence < 1 || state.confidence > 100) {
        errors.push('Confidence must be between 1 and 100%');
      }
      if (state.betAmount <= 0) {
        errors.push('Bet amount must be greater than 0');
      }
      break;
      
    case 'opinion':
      if (!state.selectedMatch) {
        errors.push('Please select a match for your opinion');
      }
      break;
      
    case 'simple':
      // No special validation for simple posts
      break;
  }
  
  // Hashtag validation
  if (state.hashtags.length > 10) {
    errors.push('You cannot add more than 10 hashtags');
  }
  
  // Validation des médias
  if (state.mediaFiles.length > 5) {
    errors.push('Vous ne pouvez pas ajouter plus de 5 médias');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateHashtag = (hashtag: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!hashtag.trim()) {
    errors.push('Le hashtag ne peut pas être vide');
  }
  
  if (hashtag.length > 50) {
    errors.push('Le hashtag ne peut pas dépasser 50 caractères');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(hashtag)) {
    errors.push('Le hashtag ne peut contenir que des lettres, chiffres et underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};