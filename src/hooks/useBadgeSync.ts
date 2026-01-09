import { useEffect } from 'react';
import { useAppBadge } from './useAppBadge';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useBets } from '@/features/betting/hooks/useBets';

/**
 * Syncs the app badge with unread notifications and pending bets count.
 * Should be used once at the app root level.
 */
export function useBadgeSync() {
  const { updateBadge, isSupported } = useAppBadge();
  const { unreadCount } = useNotifications();
  const { data: bets } = useBets({ status: 'pending' });

  useEffect(() => {
    if (!isSupported) return;

    const pendingBetsCount = bets?.length || 0;

    updateBadge({
      unreadNotifications: unreadCount,
      pendingBets: pendingBetsCount,
    });
  }, [unreadCount, bets, updateBadge, isSupported]);

  // Clear badge when app becomes visible and user checks notifications
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-sync badge when app becomes visible
        const pendingBetsCount = bets?.length || 0;
        updateBadge({
          unreadNotifications: unreadCount,
          pendingBets: pendingBetsCount,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [unreadCount, bets, updateBadge, isSupported]);

  return { isSupported };
}
