import { useState, useCallback, useRef } from 'react';

interface SwipeGesturesConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
}

export function useSwipeGestures({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  preventDefaultTouchmoveEvent = false
}: SwipeGesturesConfig) {
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartPos = useRef<TouchPosition>({ x: 0, y: 0 });
  const touchEndPos = useRef<TouchPosition>({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchEndPos.current = { x: touch.clientX, y: touch.clientY };
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const touch = e.touches[0];
    touchEndPos.current = { x: touch.clientX, y: touch.clientY };
    
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
  }, [isSwiping, preventDefaultTouchmoveEvent]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    
    const deltaX = touchEndPos.current.x - touchStartPos.current.x;
    const deltaY = touchEndPos.current.y - touchStartPos.current.y;
    
    // Vérifier que c'est un swipe horizontal (pas vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
    
    setIsSwiping(false);
  }, [isSwiping, threshold, onSwipeLeft, onSwipeRight]);

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return {
    swipeHandlers,
    isSwiping
  };
}