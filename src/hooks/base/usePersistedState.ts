import { useState, useCallback, useEffect, useRef } from 'react';

export type StorageType = 'localStorage' | 'sessionStorage';

export interface PersistedState<T> {
  value: T;
  isLoading: boolean;
  error: string | null;
}

export interface PersistedActions<T> {
  setValue: (value: T | ((prev: T) => T)) => void;
  reset: () => void;
  remove: () => void;
}

export interface UsePersistedStateOptions<T> {
  key: string;
  initialValue: T;
  storage?: StorageType;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  onError?: (error: string) => void;
}

export const usePersistedState = <T>(options: UsePersistedStateOptions<T>) => {
  const {
    key,
    initialValue,
    storage = 'localStorage',
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError,
  } = options;

  // Stabilize initialValue with ref to prevent recreation on every render
  const initialValueRef = useRef(initialValue);

  // Stabilize functions to prevent infinite loops
  const stableSerialize = useCallback(serialize, []);
  const stableDeserialize = useCallback(deserialize, []);
  const stableOnError = useCallback((msg: string) => {
    onError?.(msg);
  }, [onError]);

  const [state, setState] = useState<PersistedState<T>>({
    value: initialValueRef.current,
    isLoading: true,
    error: null,
  });

  // Load initial value from storage
  useEffect(() => {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      const storedValue = storageObj.getItem(key);
      
      if (storedValue !== null) {
        const parsed = stableDeserialize(storedValue);
        setState({
          value: parsed,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      const errorMessage = `Error loading ${key} from ${storage}: ${error}`;
      setState({
        value: initialValueRef.current,
        isLoading: false,
        error: errorMessage,
      });
      stableOnError(errorMessage);
    }
  }, [key, storage, stableDeserialize, stableOnError]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = stableDeserialize(e.newValue);
          setState(prev => ({ ...prev, value: newValue, error: null }));
        } catch (error) {
          const errorMessage = `Error parsing stored value for ${key}: ${error}`;
          setState(prev => ({ ...prev, error: errorMessage }));
          stableOnError(errorMessage);
        }
      }
    };

    // Listen for custom events for same-tab synchronization
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setState(prev => ({ ...prev, value: e.detail.value, error: null }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener);
    };
  }, [key, stableDeserialize, stableOnError]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(state.value) : value;
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      
      storageObj.setItem(key, stableSerialize(valueToStore));
      setState(prev => ({ ...prev, value: valueToStore, error: null }));
      
      // Trigger custom event for same-tab synchronization
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key, value: valueToStore }
      }));
    } catch (error) {
      const errorMessage = `Error setting ${key} in ${storage}: ${error}`;
      setState(prev => ({ ...prev, error: errorMessage }));
      stableOnError(errorMessage);
    }
  }, [key, storage, stableSerialize, state.value, stableOnError]);

  const reset = useCallback(() => {
    setValue(initialValueRef.current);
  }, [setValue]);

  const remove = useCallback(() => {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      storageObj.removeItem(key);
      setState({
        value: initialValueRef.current,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = `Error removing ${key} from ${storage}: ${error}`;
      setState(prev => ({ ...prev, error: errorMessage }));
      stableOnError(errorMessage);
    }
  }, [key, storage, stableOnError]);

  const actions: PersistedActions<T> = {
    setValue,
    reset,
    remove,
  };

  return {
    state,
    actions,
    // Convenient getters
    isReady: !state.isLoading && !state.error,
    hasValue: state.value !== initialValueRef.current,
  };
};