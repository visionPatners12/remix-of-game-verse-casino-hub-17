import { useCallback, useRef } from 'react';

/**
 * Custom hook that returns a throttled version of a callback function.
 * The callback will only be executed at most once per specified delay.
 * 
 * @param callback - The function to throttle
 * @param delay - Minimum time between calls in milliseconds
 * @returns Throttled callback function
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        // Enough time has passed, execute immediately
        lastCallRef.current = now;
        callback(...args);
      } else {
        // Schedule execution for when delay is complete
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay]
  );
}

/**
 * Hook that tracks if an action is currently throttled
 * Returns both a throttled callback and a boolean indicating if throttled
 */
export function useThrottleWithStatus<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): {
  throttledCallback: (...args: Parameters<T>) => void;
  isThrottled: boolean;
} {
  const lastCallRef = useRef<number>(0);
  const isThrottledRef = useRef<boolean>(false);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        isThrottledRef.current = false;
        callback(...args);
      } else {
        isThrottledRef.current = true;
      }
    },
    [callback, delay]
  );

  return {
    throttledCallback,
    isThrottled: isThrottledRef.current,
  };
}
