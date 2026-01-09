import { useEffect, useCallback } from 'react';

interface BadgeCounts {
  unreadNotifications?: number;
  pendingBets?: number;
}

// Check if the Badge API is supported
const isBadgeSupported = (): boolean => {
  return 'setAppBadge' in navigator && 'clearAppBadge' in navigator;
};

export function useAppBadge() {
  const updateBadge = useCallback(async (counts: BadgeCounts) => {
    if (!isBadgeSupported()) {
      return;
    }

    const total = (counts.unreadNotifications || 0) + (counts.pendingBets || 0);

    try {
      if (total > 0) {
        await navigator.setAppBadge(total);
      } else {
        await navigator.clearAppBadge();
      }
    } catch (error) {
      // Badge API might fail silently on some platforms
      console.debug('App Badge API not available:', error);
    }
  }, []);

  const clearBadge = useCallback(async () => {
    if (!isBadgeSupported()) {
      return;
    }

    try {
      await navigator.clearAppBadge();
    } catch (error) {
      console.debug('Failed to clear app badge:', error);
    }
  }, []);

  return {
    updateBadge,
    clearBadge,
    isSupported: isBadgeSupported(),
  };
}

// Global badge manager for use outside of React components
export const appBadgeManager = {
  async setBadge(count: number): Promise<void> {
    if (!isBadgeSupported()) return;
    
    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    } catch (error) {
      console.debug('App Badge API error:', error);
    }
  },

  async clearBadge(): Promise<void> {
    if (!isBadgeSupported()) return;
    
    try {
      await navigator.clearAppBadge();
    } catch (error) {
      console.debug('Failed to clear app badge:', error);
    }
  },

  isSupported(): boolean {
    return isBadgeSupported();
  }
};
