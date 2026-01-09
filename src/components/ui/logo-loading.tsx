
import { cn } from "@/lib/utils";

interface LogoLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LogoLoading({ className, size = "md", text }: LogoLoadingProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  const logoUrl = "/pryzen-logo.png";

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className="relative overflow-hidden">
        {/* Logo sliding in from left to right */}
        <div className={cn(
          "relative rounded-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center",
          sizeClasses[size]
        )}>
          <img 
            src={logoUrl} 
            alt="PRYZEN" 
            className={cn(
              "object-contain animate-pulse",
              sizeClasses[size]
            )}
            style={{
              animation: "slideInFromLeft 1.5s ease-out infinite"
            }}
          />
        </div>
        
        {/* Animated background pulse */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-blue-500/20 to-green-500/20 animate-pulse",
          sizeClasses[size]
        )} style={{ transform: "scale(1.2)" }} />
      </div>
      
      {text && (
        <p className="text-sm text-muted-foreground animate-fade-in">
          {text}
        </p>
      )}
      
      <style>
        {`
          @keyframes slideInFromLeft {
            0% {
              transform: translateX(-100%);
              opacity: 0;
            }
            50% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
