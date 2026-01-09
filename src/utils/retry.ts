import { logger } from './logger';

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: () => true,
};

/**
 * Executes a function with exponential backoff retry logic
 * 
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (!config.shouldRetry(error)) {
        throw error;
      }
      
      // Don't wait after the last attempt
      if (attempt < config.maxRetries) {
        // Calculate delay with exponential backoff + jitter
        const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
        const jitter = Math.random() * 0.3 * exponentialDelay;
        const delay = Math.min(exponentialDelay + jitter, config.maxDelayMs);
        
        logger.debug(`[Retry] Attempt ${attempt + 1}/${config.maxRetries} failed, retrying in ${Math.round(delay)}ms`);
        
        await sleep(delay);
      }
    }
  }
  
  logger.error(`[Retry] All ${config.maxRetries} retries exhausted`);
  throw lastError;
}

/**
 * Helper to check if an error is retriable (network errors, 5xx, etc.)
 */
export function isRetriableError(error: unknown): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // HTTP errors - retry on 5xx and some 4xx
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Server errors
    if (message.includes('500') || message.includes('502') || 
        message.includes('503') || message.includes('504')) {
      return true;
    }
    
    // Rate limiting
    if (message.includes('429') || message.includes('rate limit')) {
      return true;
    }
    
    // Network issues
    if (message.includes('network') || message.includes('timeout') || 
        message.includes('aborted') || message.includes('connection')) {
      return true;
    }
  }
  
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
