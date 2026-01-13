import { Skeleton } from '../skeleton';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  /** Afficher une image en haut */
  withImage?: boolean;
  /** Nombre de lignes de texte */
  lines?: number;
}

/**
 * Skeleton générique pour les cards
 */
export function SkeletonCard({ 
  className,
  withImage = false,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div className={cn('p-4 border border-border rounded-lg space-y-3', className)}>
      {withImage && (
        <Skeleton className="w-full h-32 rounded-md" />
      )}
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn('h-3', i === lines - 2 ? 'w-1/2' : 'w-full')} 
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton pour les cards horizontales (type match)
 */
export function SkeletonMatchCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-10" />
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour les cards compactes
 */
export function SkeletonCompactCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 p-3', className)}>
      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
    </div>
  );
}
