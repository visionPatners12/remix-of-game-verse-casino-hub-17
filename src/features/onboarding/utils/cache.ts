import { logger } from '@/utils/logger';
import { ONBOARDING_CACHE_KEY, ONBOARDING_PROGRESS_KEY, ONBOARDING_CACHE_DURATION } from '../constants';

/**
 * Centralized cache management utilities for onboarding
 */

export const createCacheKey = (userId: string, type: 'status' | 'progress') => {
  const baseKey = type === 'status' ? ONBOARDING_CACHE_KEY : ONBOARDING_PROGRESS_KEY;
  return `${baseKey}_${userId}`;
};

export const getCachedData = <T>(key: string, maxAge: number = ONBOARDING_CACHE_DURATION): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < maxAge) {
        return parsed.data;
      }
      // Auto-cleanup expired cache
      localStorage.removeItem(key);
    }
  } catch (error) {
    logger.debug('Cache read error:', error);
    // Clear corrupted cache
    localStorage.removeItem(key);
  }
  return null;
};

export const setCachedData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    logger.debug('Cache write error:', error);
  }
};

export const removeCachedData = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    logger.debug('Cache remove error:', error);
  }
};

export const cleanupExpiredCache = (): void => {
  const keys = Object.keys(localStorage);
  const now = Date.now();
  
  keys.forEach(key => {
    if (key.startsWith(ONBOARDING_CACHE_KEY) || key.startsWith(ONBOARDING_PROGRESS_KEY)) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.timestamp && now - data.timestamp > ONBOARDING_CACHE_DURATION * 2) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  });
};