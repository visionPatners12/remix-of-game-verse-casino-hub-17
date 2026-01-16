import { cn } from '@/lib/utils';

interface BrandedLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 'w-12 h-12',
    logo: 'h-6 w-6',
    ring: 'w-12 h-12 border-2',
    text: 'text-xs',
  },
  md: {
    container: 'w-20 h-20',
    logo: 'h-10 w-10',
    ring: 'w-20 h-20 border-2',
    text: 'text-sm',
  },
  lg: {
    container: 'w-28 h-28',
    logo: 'h-14 w-14',
    ring: 'w-28 h-28 border-3',
    text: 'text-base',
  },
  xl: {
    container: 'w-36 h-36',
    logo: 'h-18 w-18',
    ring: 'w-36 h-36 border-4',
    text: 'text-lg',
  },
};

export function BrandedLoader({ 
  size = 'lg', 
  text, 
  showText = true,
  className 
}: BrandedLoaderProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      {/* Container with logo and orbital ring */}
      <div className={cn("relative", config.container)}>
        {/* Orbital ring */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full animate-spin-orbital",
            config.ring
          )}
          style={{
            borderColor: 'transparent',
            borderTopColor: 'hsl(var(--primary))',
            borderRightColor: 'hsl(var(--primary) / 0.5)',
          }}
        />
        
        {/* Secondary ring - slower, opposite direction */}
        <div 
          className={cn(
            "absolute inset-1 rounded-full animate-spin-orbital-reverse",
            config.ring
          )}
          style={{
            borderColor: 'transparent',
            borderBottomColor: 'hsl(var(--primary) / 0.3)',
            borderLeftColor: 'hsl(var(--primary) / 0.15)',
          }}
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse-glow" />
        
        {/* Logo container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="/pryzen-logo.png" 
            alt="PRYZEN" 
            className={cn("object-contain animate-pulse-subtle", config.logo)}
          />
        </div>
      </div>
      
      {/* Loading text */}
      {showText && text && (
        <p className={cn(
          "text-muted-foreground font-medium animate-pulse",
          config.text
        )}>
          {text}
        </p>
      )}
    </div>
  );
}
