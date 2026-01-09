import { useState, useCallback } from 'react';

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

export interface FormActions<T> {
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  reset: () => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => Promise<void>;
}

export interface UseFormStateOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSuccess?: (values: T) => void;
  onError?: (error: string) => void;
}

export const useFormState = <T extends Record<string, any>>(
  options: UseFormStateOptions<T>
) => {
  const { initialValues, validate, onSuccess, onError } = options;

  const [state, setState] = useState<FormState<T>>({
    values: { ...initialValues },
    errors: {},
    isSubmitting: false,
    isDirty: false,
    isValid: true,
  });

  const setValue = useCallback((field: keyof T, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value };
      const errors = validate ? validate(newValues) : {};
      
      return {
        ...prev,
        values: newValues,
        errors,
        isDirty: true,
        isValid: Object.keys(errors).length === 0,
      };
    });
  }, [validate]);

  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const errors = validate ? validate(newValues) : {};
      
      return {
        ...prev,
        values: newValues,
        errors,
        isDirty: true,
        isValid: Object.keys(errors).length === 0,
      };
    });
  }, [validate]);

  const setError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      values: { ...initialValues },
      errors: {},
      isSubmitting: false,
      isDirty: false,
      isValid: true,
    });
  }, [initialValues]);

  const handleSubmit = useCallback(async (onSubmit: (values: T) => Promise<void> | void) => {
    if (!state.isValid) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(state.values);
      onSuccess?.(state.values);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      onError?.(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, state.isValid, onSuccess, onError]);

  const actions: FormActions<T> = {
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    reset,
    handleSubmit,
  };

  return {
    state,
    actions,
    // Convenient getters
    canSubmit: state.isValid && !state.isSubmitting && state.isDirty,
    hasErrors: Object.keys(state.errors).length > 0,
  };
};