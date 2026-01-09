import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useStandaloneMode } from "@/hooks/useStandaloneMode";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";

interface DownloadButtonsProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function DownloadButtons({ variant = "default", size = "lg", className }: DownloadButtonsProps) {
  const { isStandalone } = useStandaloneMode();

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
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <PWAInstallButton variant={variant} size={size} className="min-w-[180px]" />
    </div>
  );
}
