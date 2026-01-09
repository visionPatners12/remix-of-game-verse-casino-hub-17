import { lazy, ComponentType } from 'react';
import { logger } from './logger';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

/**
 * Creates a lazy-loaded component with automatic retry on failure.
 * Useful for handling network issues or chunk loading failures after deployments.
 * 
 * Features:
 * - 3 retry attempts with exponential backoff (1.5s, 3s, 6s)
 * - Automatic page reload on final failure if it's a dynamic import error
 * - Only reloads once per session to avoid infinite reload loops
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        
        const isLastAttempt = attempt === MAX_RETRIES - 1;
        
        if (!isLastAttempt) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
          logger.warn(`[LazyLoad] Attempt ${attempt + 1}/${MAX_RETRIES} failed, retrying in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }
    
    // All retries exhausted - check if we should reload the page
    const isDynamicImportError = 
      lastError?.message.includes('dynamically imported module') ||
      lastError?.message.includes('Failed to fetch') ||
      lastError?.message.includes('Loading chunk');
    
    const hasAttemptedReload = sessionStorage.getItem('chunk_reload_attempted') === 'true';
    
    if (isDynamicImportError && !hasAttemptedReload) {
      logger.warn('[LazyLoad] All retries exhausted, reloading page...');
      sessionStorage.setItem('chunk_reload_attempted', 'true');
      window.location.reload();
      // Return a never-resolving promise while the page reloads
      return new Promise(() => {});
    }
    
    // Clear the reload flag for next time
    sessionStorage.removeItem('chunk_reload_attempted');
    
    logger.error('[LazyLoad] Failed to load component after all retries', lastError);
    throw lastError;
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
