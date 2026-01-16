import { cn } from '@/lib/utils';
import { BrandedLoader } from './branded-loader';

interface FullPageLoaderProps {
  text?: string;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

export function FullPageLoader({ 
  text = "Chargement...", 
  size = 'lg',
  className 
}: FullPageLoaderProps) {
  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col items-center justify-center",
        "bg-gradient-to-br from-background via-background to-primary/5",
        className
      )}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>
      
      {/* Loader */}
      <div className="relative z-10">
        <BrandedLoader size={size} text={text} />
      </div>
    </div>
  );
}
