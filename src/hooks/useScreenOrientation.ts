import { useEffect } from 'react';

/**
 * Hook to lock screen orientation to portrait mode on mobile devices.
 * Uses the Screen Orientation API when available.
 * Automatically unlocks orientation when entering fullscreen (for videos)
 * and re-locks when exiting fullscreen.
 */
export function useScreenOrientation() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orientation = screen.orientation as any;

    const lockToPortrait = async () => {
      // Only lock if not in fullscreen (allow videos to rotate)
      if (document.fullscreenElement) return;
      
      try {
        if (orientation?.lock) {
          await orientation.lock('portrait');
        }
      } catch (error) {
        // Silently fail - API not supported on iOS Safari, desktop browsers, etc.
        console.debug('Screen orientation lock not supported:', error);
      }
    };

    const handleFullscreenChange = async () => {
      if (document.fullscreenElement) {
        // Entering fullscreen (video) - unlock orientation to allow rotation
        try {
          orientation?.unlock?.();
        } catch {
          // Ignore errors
        }
      } else {
        // Exiting fullscreen - re-lock to portrait
        await lockToPortrait();
      }
    };

    // Initial lock
    lockToPortrait();

    // Listen for fullscreen changes (standard + webkit for Safari)
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      
      try {
        orientation?.unlock?.();
      } catch {
        // Ignore errors on cleanup
      }
    };
  }, []);
}
