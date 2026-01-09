
import { usePersistedState } from './base';

export const useLocalStorage = <T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  const { state, actions } = usePersistedState({
    key,
    initialValue,
    storage: 'localStorage',
  });

  return [state.value, actions.setValue];
};
