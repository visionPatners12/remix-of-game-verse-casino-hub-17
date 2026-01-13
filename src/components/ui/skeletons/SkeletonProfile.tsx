import { Skeleton } from '../skeleton';
import { cn } from '@/lib/utils';

interface SkeletonProfileProps {
  className?: string;
  /** Version compacte pour les cards */
  compact?: boolean;
}

/**
 * Skeleton pour les profils utilisateur
 */
export function SkeletonProfile({ className, compact = false }: SkeletonProfileProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header avec avatar */}
      <div className="flex items-start gap-4">
        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-4 mt-2">
            <div className="text-center">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-3 w-12 mt-1" />
            </div>
            <div className="text-center">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-3 w-12 mt-1" />
            </div>
            <div className="text-center">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-3 w-12 mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour les headers de page profil (équipe, ligue, joueur)
 */
export function SkeletonEntityHeader({ 
  className,
  type = 'team',
}: { 
  className?: string;
  type?: 'team' | 'league' | 'player';
}) {
  const isRound = type === 'player';

  return (
    <div className={cn('p-4 space-y-4', className)}>
      <div className="flex items-start gap-4">
        <Skeleton 
          className={cn(
            'w-20 h-20 shrink-0',
            isRound ? 'rounded-full' : 'rounded-lg'
          )} 
        />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-4 mt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-5 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  );
}
