
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < MOBILE_BREAKPOINT;
  const isTablet = windowSize.width >= MOBILE_BREAKPOINT && windowSize.width < TABLET_BREAKPOINT;
  const isDesktop = windowSize.width >= TABLET_BREAKPOINT;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isTabletUp: isTablet || isDesktop,
    isMobileOnly: isMobile && !isTablet && !isDesktop,
    windowWidth: windowSize.width,
    windowHeight: windowSize.height,
  };
}
