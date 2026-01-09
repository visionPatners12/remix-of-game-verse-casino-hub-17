import { useState, useEffect } from 'react';

interface StandaloneModeResult {
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

// Helper function to detect standalone mode (can be called during init)
const detectStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

// Helper function to detect platform
const detectPlatform = () => {
  if (typeof window === 'undefined') return { ios: false, android: false };
  const userAgent = window.navigator.userAgent.toLowerCase();
  return {
    ios: /iphone|ipad|ipod/.test(userAgent),
    android: /android/.test(userAgent),
  };
};

export function useStandaloneMode(): StandaloneModeResult {
  // Initialize with actual values instead of false to prevent flash
  const [isStandalone, setIsStandalone] = useState(detectStandalone);
  const [isIOS] = useState(() => detectPlatform().ios);
  const [isAndroid] = useState(() => detectPlatform().android);

  useEffect(() => {
    // Listen for display mode changes (rare but possible)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { isStandalone, isIOS, isAndroid };
}
