import { Skeleton } from '../skeleton';
import { cn } from '@/lib/utils';

interface SkeletonGameProps {
  className?: string;
}

/**
 * Skeleton pour la page de jeu Ludo
 */
export function SkeletonLudoGame({ className }: SkeletonGameProps) {
  return (
    <div className={cn('min-h-screen bg-background p-4 space-y-6', className)}>
      {/* Header avec infos de la partie */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Plateau de jeu */}
      <div className="aspect-square max-w-md mx-auto">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>

      {/* Zone des dés */}
      <div className="flex justify-center gap-4">
        <Skeleton className="w-16 h-16 rounded-lg" />
      </div>

      {/* Joueurs */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2 p-3 border border-border rounded-lg">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton pour la liste des parties
 */
export function SkeletonGameList({ className, count = 4 }: { className?: string; count?: number }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonGameCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton pour une carte de partie
 */
export function SkeletonGameCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 border border-border rounded-lg space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      {/* Joueurs */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="w-8 h-8 rounded-full" />
        ))}
        <Skeleton className="h-4 w-12 ml-auto" />
      </div>

      {/* Mise */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour le lobby de jeu
 */
export function SkeletonGameLobby({ className }: SkeletonGameProps) {
  return (
    <div className={cn('min-h-screen bg-background p-4 space-y-6', className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>

      {/* Code de la partie */}
      <div className="p-4 border border-border rounded-lg">
        <Skeleton className="h-4 w-24 mx-auto mb-3" />
        <Skeleton className="h-12 w-32 mx-auto rounded-lg" />
      </div>

      {/* Liste des joueurs */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="w-6 h-6 rounded" />
          </div>
        ))}
      </div>

      {/* Bouton démarrer */}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}
