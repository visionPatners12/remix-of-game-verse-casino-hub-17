import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Apple, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { IOSInstallGuide } from './IOSInstallGuide';
import { AndroidInstallGuide } from './AndroidInstallGuide';

interface PWAInstallButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  platform?: "ios" | "android" | "both";
  className?: string;
}

export function PWAInstallButton({ 
  variant = "default", 
  size = "default", 
  platform = "both",
  className 
}: PWAInstallButtonProps) {
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const { isIOS, canPromptNatively, promptInstall } = usePWAInstall();

  const handleIOSClick = useCallback(() => {
    setShowIOSGuide(true);
  }, []);

  const handleAndroidClick = useCallback(async () => {
    if (canPromptNatively) {
      await promptInstall();
    } else {
      // Fallback: show manual guide
      setShowAndroidGuide(true);
    }
  }, [canPromptNatively, promptInstall]);

  return (
    <>
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        {(platform === "ios" || platform === "both") && (
          <Button 
            variant={variant} 
            size={size}
            onClick={handleIOSClick}
            className="gap-2"
          >
            <Apple className="h-5 w-5" />
            <span>Download iOS</span>
          </Button>
        )}
        {(platform === "android" || platform === "both") && !isIOS && (
          <Button 
            variant={variant} 
            size={size}
            onClick={handleAndroidClick}
            className="gap-2"
          >
            <Smartphone className="h-5 w-5" />
            <span>Download Android</span>
          </Button>
        )}
      </div>

      <IOSInstallGuide 
        isOpen={showIOSGuide} 
        onClose={() => setShowIOSGuide(false)} 
      />
      
      <AndroidInstallGuide
        isOpen={showAndroidGuide}
        onClose={() => setShowAndroidGuide(false)}
      />
    </>
  );
}
