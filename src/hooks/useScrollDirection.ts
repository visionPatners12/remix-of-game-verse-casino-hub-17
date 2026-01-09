import { useState, useEffect, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionOptions {
  threshold?: number;
  initialDirection?: ScrollDirection;
}

export function useScrollDirection({ 
  threshold = 10, 
  initialDirection = null 
}: UseScrollDirectionOptions = {}) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(initialDirection);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    // Initialize with current scroll position
    lastScrollY.current = window.scrollY;
    
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      // Always update isAtTop
      setIsAtTop(scrollY < 10);
      
      // Calculate difference
      const diff = scrollY - lastScrollY.current;
      
      // Don't do anything if change is too small
      if (Math.abs(diff) < threshold) {
        ticking.current = false;
        return;
      }

      // Determine direction
      const newDirection = diff > 0 ? 'down' : 'up';
      
      // Update state (React will optimize if value is the same)
      setScrollDirection(newDirection);
      
      // ALWAYS update lastScrollY after threshold is exceeded
      lastScrollY.current = scrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      // Use requestAnimationFrame for throttling
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold]); // Removed scrollDirection from dependencies!

  return { scrollDirection, isAtTop };
}
