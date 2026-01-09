import { useCallback, useRef } from 'react';
import { useHapticFeedback } from './useHapticFeedback';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
  hapticOnTrigger?: boolean;
}

interface LongPressHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
}

/**
 * Hook for detecting long press gestures
 * Provides a native app feel for contextual menus and actions
 */
export function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
  hapticOnTrigger = true
}: UseLongPressOptions): LongPressHandlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const { mediumTap } = useHapticFeedback();

  const start = useCallback((clientX: number, clientY: number) => {
    isLongPressRef.current = false;
    startPosRef.current = { x: clientX, y: clientY };

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (hapticOnTrigger) {
        mediumTap();
      }
      onLongPress();
    }, delay);
  }, [delay, hapticOnTrigger, mediumTap, onLongPress]);

  const clear = useCallback((shouldTriggerClick = false) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (shouldTriggerClick && !isLongPressRef.current && onClick) {
      onClick();
    }

    startPosRef.current = null;
  }, [onClick]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    start(e.clientX, e.clientY);
  }, [start]);

  const onMouseUp = useCallback(() => {
    clear(true);
  }, [clear]);

  const onMouseLeave = useCallback(() => {
    clear(false);
  }, [clear]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    start(touch.clientX, touch.clientY);
  }, [start]);

  const onTouchEnd = useCallback(() => {
    clear(true);
  }, [clear]);

  const onTouchMove = useCallback(() => {
    // Cancel if user moved too much (scrolling instead of long pressing)
    clear(false);
  }, [clear]);

  return {
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchEnd,
    onTouchMove
  };
}
