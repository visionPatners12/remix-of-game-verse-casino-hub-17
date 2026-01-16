import { useCallback, useEffect, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { toast } from 'sonner';
import { isRetriableError } from '@/utils/retry';

type QueuedAction = () => Promise<void>;

interface UseNetworkRetryOptions {
  showToast?: boolean;
  autoRetryOnReconnect?: boolean;
  maxQueueSize?: number;
}

/**
 * Hook for handling network-related retries with automatic reconnection detection
 */
export function useNetworkRetry(options: UseNetworkRetryOptions = {}) {
  const {
    showToast = true,
    autoRetryOnReconnect = true,
    maxQueueSize = 5,
  } = options;

  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();
  const actionQueue = useRef<QueuedAction[]>([]);
  const toastIdRef = useRef<string | number | undefined>();

  // Process queued actions when back online
  useEffect(() => {
    if (isOnline && wasOffline && autoRetryOnReconnect) {
      resetWasOffline();
      
      if (actionQueue.current.length > 0) {
        if (showToast) {
          toast.success('Connexion rétablie', {
            description: `${actionQueue.current.length} action(s) en attente...`,
          });
        }

        // Process queued actions
        const actions = [...actionQueue.current];
        actionQueue.current = [];
        
        actions.forEach(async (action) => {
          try {
            await action();
          } catch (error) {
            console.error('[NetworkRetry] Queued action failed:', error);
          }
        });
      } else if (showToast) {
        toast.success('Connexion rétablie');
      }
    }
  }, [isOnline, wasOffline, resetWasOffline, autoRetryOnReconnect, showToast]);

  // Dismiss offline toast when back online
  useEffect(() => {
    if (isOnline && toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = undefined;
    }
  }, [isOnline]);

  /**
   * Queue an action to be retried when network is restored
   */
  const queueAction = useCallback((action: QueuedAction) => {
    if (actionQueue.current.length < maxQueueSize) {
      actionQueue.current.push(action);
    }
  }, [maxQueueSize]);

  /**
   * Execute an action with automatic network error handling
   */
  const executeWithRetry = useCallback(async <T>(
    action: () => Promise<T>,
    options?: {
      onError?: (error: unknown) => void;
      queueOnFailure?: boolean;
    }
  ): Promise<T | null> => {
    try {
      return await action();
    } catch (error) {
      const isNetworkError = isRetriableError(error);

      if (isNetworkError) {
        if (showToast && !toastIdRef.current) {
          toastIdRef.current = toast.error('Erreur réseau', {
            description: 'La connexion a échoué. Réessayez plus tard.',
            duration: Infinity,
            action: {
              label: 'Réessayer',
              onClick: () => action().catch(() => {}),
            },
          });
        }

        if (options?.queueOnFailure) {
          queueAction(async () => { await action(); });
        }
      }

      options?.onError?.(error);
      return null;
    }
  }, [showToast, queueAction]);

  /**
   * Check if an error is network-related
   */
  const isNetworkError = useCallback((error: unknown): boolean => {
    return isRetriableError(error);
  }, []);

  return {
    isOnline,
    wasOffline,
    queueAction,
    executeWithRetry,
    isNetworkError,
    queueLength: actionQueue.current.length,
  };
}
