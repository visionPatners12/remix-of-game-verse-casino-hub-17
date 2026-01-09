import { useCallback } from 'react';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 5,
  medium: 10,
  heavy: 20,
  selection: 3,
  success: [10, 50, 10],
  warning: [15, 30, 15],
  error: [20, 50, 20, 50, 20]
};

/**
 * Hook for triggering haptic feedback on supported devices
 * Provides a native app feel for touch interactions
 */
export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Check if vibration API is available
    if (!('vibrate' in navigator)) return;
    
    const pattern = HAPTIC_PATTERNS[type];
    
    try {
      navigator.vibrate(pattern);
    } catch {
      // Silently fail if vibration not supported
    }
  }, []);

  const lightTap = useCallback(() => triggerHaptic('light'), [triggerHaptic]);
  const mediumTap = useCallback(() => triggerHaptic('medium'), [triggerHaptic]);
  const heavyTap = useCallback(() => triggerHaptic('heavy'), [triggerHaptic]);
  const selectionTap = useCallback(() => triggerHaptic('selection'), [triggerHaptic]);
  const successFeedback = useCallback(() => triggerHaptic('success'), [triggerHaptic]);
  const warningFeedback = useCallback(() => triggerHaptic('warning'), [triggerHaptic]);
  const errorFeedback = useCallback(() => triggerHaptic('error'), [triggerHaptic]);

  return {
    triggerHaptic,
    lightTap,
    mediumTap,
    heavyTap,
    selectionTap,
    successFeedback,
    warningFeedback,
    errorFeedback
  };
}
