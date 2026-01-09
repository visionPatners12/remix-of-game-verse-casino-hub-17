
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileAppBannerState {
  isVisible: boolean;
  height: number;
  isDismissed: boolean;
}

export function useMobileAppBanner() {
  const [bannerState, setBannerState] = useState<MobileAppBannerState>({
    isVisible: false,
    height: 0,
    isDismissed: false
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('mobile-app-banner-dismissed');
    if (dismissed) {
      setBannerState(prev => ({ ...prev, isDismissed: true }));
      return;
    }

    // Show banner only on mobile with delay
    if (isMobile) {
      const timer = setTimeout(() => {
        setBannerState(prev => ({ 
          ...prev, 
          isVisible: true, 
          height: 64 // Approximate banner height
        }));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const dismissBanner = () => {
    setBannerState({ isVisible: false, height: 0, isDismissed: true });
    localStorage.setItem('mobile-app-banner-dismissed', 'true');
  };

  return {
    ...bannerState,
    dismissBanner,
    shouldShow: isMobile && !bannerState.isDismissed && bannerState.isVisible
  };
}
