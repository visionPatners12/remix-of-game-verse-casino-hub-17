
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect mobile viewport
 * @param freezeOnFullscreen - If true, prevents updates when fullscreen is active (prevents layout shifts on rotation)
 */
export function useIsMobile(freezeOnFullscreen = false) {
  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const checkMobile = () => {
      // Si fullscreen actif et freeze demandé, ne pas mettre à jour
      if (freezeOnFullscreen && document.fullscreenElement) {
        return;
      }
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Set initial value
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [freezeOnFullscreen]);

  return isMobile;
}
