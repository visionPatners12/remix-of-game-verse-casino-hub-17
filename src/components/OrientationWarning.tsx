import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Shows a fullscreen overlay on mobile iOS/unsupported browsers when device is in landscape mode.
 * Automatically hides when a video is in fullscreen mode to allow landscape viewing.
 * Only shows on mobile devices.
 */
export function OrientationWarning() {
  const isMobile = useIsMobile(true); // freeze on fullscreen to prevent layout shifts
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkState = () => {
      // Check if in landscape (width > height)
      const landscape = window.innerWidth > window.innerHeight;
      
      // Check if any element is in fullscreen (video player)
      const fullscreen = !!(
        document.fullscreenElement || 
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      
      setIsLandscape(landscape);
      setIsFullscreen(fullscreen);
    };

    // Check initially
    checkState();

    // Listen for orientation/resize changes
    window.addEventListener('resize', checkState);
    window.addEventListener('orientationchange', checkState);
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', checkState);
    document.addEventListener('webkitfullscreenchange', checkState);
    document.addEventListener('mozfullscreenchange', checkState);
    document.addEventListener('MSFullscreenChange', checkState);

    return () => {
      window.removeEventListener('resize', checkState);
      window.removeEventListener('orientationchange', checkState);
      document.removeEventListener('fullscreenchange', checkState);
      document.removeEventListener('webkitfullscreenchange', checkState);
      document.removeEventListener('mozfullscreenchange', checkState);
      document.removeEventListener('MSFullscreenChange', checkState);
    };
  }, []);

  // Don't show warning if not mobile, in portrait, or if fullscreen (video mode)
  if (!isMobile || !isLandscape || isFullscreen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <div className="text-center p-6">
        <RotateCcw className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
        <p className="text-lg font-medium text-foreground">
          Veuillez tourner votre appareil
        </p>
        <p className="text-muted-foreground mt-2">
          Cette application est optimisée pour le mode portrait
        </p>
      </div>
    </div>
  );
}
