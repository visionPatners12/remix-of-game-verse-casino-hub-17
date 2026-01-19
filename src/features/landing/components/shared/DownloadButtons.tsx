import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Apple, Smartphone } from "lucide-react";
import { useStandaloneMode } from "@/hooks/useStandaloneMode";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { IOSInstallGuide } from "@/components/pwa/IOSInstallGuide";

interface DownloadButtonsProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function DownloadButtons({ variant = "default", size = "lg", className }: DownloadButtonsProps) {
  const { isStandalone } = useStandaloneMode();
  const { isIOS, promptInstall } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const handleDownload = useCallback(async () => {
    if (isIOS) {
      setShowIOSGuide(true);
    } else {
      await promptInstall();
    }
  }, [isIOS, promptInstall]);

  if (isStandalone) {
    return (
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <Link to="/auth">
          <Button variant={variant} size={size} className="gap-2">
            <ExternalLink className="h-5 w-5" />
            <span>Open App</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
        <Button 
          variant={variant} 
          size={size} 
          className="min-w-[180px] gap-2"
          onClick={handleDownload}
        >
          {isIOS ? (
            <>
              <Apple className="h-5 w-5" />
              <span>Download for iPhone</span>
            </>
          ) : (
            <>
              <Smartphone className="h-5 w-5" />
              <span>Download App</span>
            </>
          )}
        </Button>
      </div>

      <IOSInstallGuide 
        isOpen={showIOSGuide} 
        onClose={() => setShowIOSGuide(false)} 
      />
    </>
  );
}
