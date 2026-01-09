import { Smartphone } from "lucide-react";

interface ScreenshotPlaceholderProps {
  label: string;
  className?: string;
}

export function ScreenshotPlaceholder({ label, className }: ScreenshotPlaceholderProps) {
  return (
    <div className={`relative w-full h-full min-h-[200px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ${className}`}>
      <div className="text-center p-4">
        <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary/20 flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}
