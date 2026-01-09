import { useState, useCallback, useEffect } from 'react';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface AsyncActions<T> {
  execute: (asyncFn: () => Promise<T>) => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

export interface UseAsyncStateOptions {
  initialData?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useAsyncState = <T = any>(options: UseAsyncStateOptions = {}) => {
  const { initialData = null, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await asyncFn();
      setState(prev => ({ ...prev, data: result, isLoading: false }));
      onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      onError?.(errorMessage);
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: initialData, isLoading: false, error: null });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data, error: null }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const actions: AsyncActions<T> = {
    execute,
    reset,
    setData,
    setError,
  };

  return {
    state,
    actions,
    // Convenient computed values
    isReady: !state.isLoading && !state.error,
    hasData: state.data !== null,
    isEmpty: state.data === null && !state.isLoading,
  };
};