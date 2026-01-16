import { cn } from '@/lib/utils';
import { BrandedLoader } from './branded-loader';

interface SectionLoaderProps {
  text?: string;
  size?: 'sm' | 'md';
  className?: string;
  minHeight?: string;
}

export function SectionLoader({ 
  text = "Chargement...", 
  size = 'sm',
  className,
  minHeight = "py-12"
}: SectionLoaderProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center",
        minHeight,
        className
      )}
    >
      <BrandedLoader size={size} text={text} />
    </div>
  );
}
