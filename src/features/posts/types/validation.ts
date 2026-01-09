// Validation Types

export interface ValidationRule {
  field: string;
  message: string;
  validator: (value: any) => boolean;
}

export interface FieldValidation {
  isValid: boolean;
  message?: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface ValidationConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

export interface PostValidationRules {
  content: ValidationConfig;
  hashtags: ValidationConfig;
  mediaFiles: ValidationConfig;
  betAmount: ValidationConfig;
  confidence: ValidationConfig;
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}