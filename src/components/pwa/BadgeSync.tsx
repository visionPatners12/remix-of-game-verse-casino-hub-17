import { useBadgeSync } from '@/hooks/useBadgeSync';

/**
 * Component that syncs the PWA app badge with unread notifications and pending bets.
 * Renders nothing - just manages the badge state.
 */
export function BadgeSync() {
  useBadgeSync();
  return null;
}
