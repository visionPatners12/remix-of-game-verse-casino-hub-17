// Centralized logging utility with proper levels
const isDev = import.meta.env.DEV;

interface LogContext {
  [key: string]: unknown;
}

/**
 * Centralized logger with semantic levels
 * Only essential logs in production
 */
export const logger = {
  /**
   * Debug logs - development only
   */
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) console.log('[DEBUG]', message, ...args);
  },
  
  /**
   * Info logs - development only
   */
  info: (message: string, ...args: unknown[]) => {
    if (isDev) console.info('[INFO]', message, ...args);
  },
  
  /**
   * Warning logs - always shown
   */
  warn: (message: string, ...args: unknown[]) => {
    console.warn('[WARN]', message, ...args);
  },
  
  /**
   * Error logs - always shown
   */
  error: (message: string, ...args: unknown[]) => {
    console.error('[ERROR]', message, ...args);
  },

  // Domain-specific loggers - development only
  auth: (message: string, ...args: unknown[]) => {
    if (isDev) console.log('🔐 [AUTH]', message, ...args);
  },

  wallet: (message: string, ...args: unknown[]) => {
    if (isDev) console.log('💰 [WALLET]', message, ...args);
  },

  stream: (message: string, ...args: unknown[]) => {
    if (isDev) console.log('📺 [STREAM]', message, ...args);
  },

  api: (message: string, ...args: unknown[]) => {
    if (isDev) console.log('🌐 [API]', message, ...args);
  }
};