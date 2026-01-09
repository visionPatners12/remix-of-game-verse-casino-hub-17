import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Storage for scroll positions by route
const scrollPositions = new Map<string, number>();

/**
 * Hook to save and restore scroll positions when navigating between routes
 * Provides a native app feel by remembering where users were on each page
 */
export function useScrollRestoration(scrollElementRef?: React.RefObject<HTMLElement>) {
  const location = useLocation();
  const previousPathRef = useRef<string>(location.pathname);
  const isRestoringRef = useRef(false);

  // Get the scrollable element (default to window)
  const getScrollElement = useCallback(() => {
    return scrollElementRef?.current || window;
  }, [scrollElementRef]);

  const getScrollTop = useCallback(() => {
    const element = getScrollElement();
    if (element === window) {
      return window.scrollY;
    }
    return (element as HTMLElement).scrollTop;
  }, [getScrollElement]);

  const setScrollTop = useCallback((value: number) => {
    const element = getScrollElement();
    if (element === window) {
      window.scrollTo({ top: value, behavior: 'instant' });
    } else {
      (element as HTMLElement).scrollTop = value;
    }
  }, [getScrollElement]);

  // Save scroll position when leaving a route
  useEffect(() => {
    const handleScroll = () => {
      if (!isRestoringRef.current) {
        scrollPositions.set(location.pathname, getScrollTop());
      }
    };

    // Debounce scroll saves
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    const element = getScrollElement();
    element.addEventListener('scroll', debouncedScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      element.removeEventListener('scroll', debouncedScroll);
      // Save position when unmounting
      scrollPositions.set(location.pathname, getScrollTop());
    };
  }, [location.pathname, getScrollElement, getScrollTop]);

  // Restore scroll position when entering a route
  useEffect(() => {
    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;

    // Only restore if we're coming back to a previously visited route
    if (previousPath !== currentPath) {
      const savedPosition = scrollPositions.get(currentPath);
      
      if (savedPosition !== undefined && savedPosition > 0) {
        isRestoringRef.current = true;
        
        // Small delay to ensure DOM is ready
        requestAnimationFrame(() => {
          setScrollTop(savedPosition);
          
          // Reset restoration flag after animation frame
          requestAnimationFrame(() => {
            isRestoringRef.current = false;
          });
        });
      } else {
        // Scroll to top for new routes
        setScrollTop(0);
      }
      
      previousPathRef.current = currentPath;
    }
  }, [location.pathname, setScrollTop]);

  // Manual save function
  const savePosition = useCallback(() => {
    scrollPositions.set(location.pathname, getScrollTop());
  }, [location.pathname, getScrollTop]);

  // Manual restore function
  const restorePosition = useCallback(() => {
    const savedPosition = scrollPositions.get(location.pathname);
    if (savedPosition !== undefined) {
      setScrollTop(savedPosition);
    }
  }, [location.pathname, setScrollTop]);

  // Clear all saved positions
  const clearAllPositions = useCallback(() => {
    scrollPositions.clear();
  }, []);

  return {
    savePosition,
    restorePosition,
    clearAllPositions
  };
}
