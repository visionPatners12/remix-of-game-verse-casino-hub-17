import { Skeleton } from '../skeleton';
import { cn } from '@/lib/utils';

interface SkeletonFeedProps {
  className?: string;
  /** Nombre de posts à afficher */
  count?: number;
}

/**
 * Skeleton pour le feed social
 */
export function SkeletonFeed({ className, count = 3 }: SkeletonFeedProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPost key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton pour un post individuel
 */
export function SkeletonPost({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 border border-border rounded-lg space-y-3', className)}>
      {/* Header avec avatar et nom */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="w-6 h-6 rounded" />
      </div>

      {/* Contenu du post */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Image optionnelle (50% de chance visuellement) */}
      <Skeleton className="w-full h-48 rounded-lg" />

      {/* Actions */}
      <div className="flex items-center gap-6 pt-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour le feed timeline (matchs + highlights)
 */
export function SkeletonTimeline({ className, count = 4 }: SkeletonFeedProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTimelineItem key={i} type={i % 2 === 0 ? 'match' : 'highlight'} />
      ))}
    </div>
  );
}

/**
 * Skeleton pour un item de timeline
 */
function SkeletonTimelineItem({ 
  type = 'match' 
}: { 
  type?: 'match' | 'highlight';
}) {
  if (type === 'highlight') {
    return (
      <div className="rounded-lg overflow-hidden border border-border">
        {/* Video thumbnail */}
        <Skeleton className="w-full aspect-video" />
        {/* Info */}
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-border rounded-lg space-y-3">
      {/* League info */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>

      {/* Match */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="px-4">
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour les stories horizontales
 */
export function SkeletonStories({ className, count = 6 }: { className?: string; count?: number }) {
  return (
    <div className={cn('flex gap-3 overflow-hidden px-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1 shrink-0">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
