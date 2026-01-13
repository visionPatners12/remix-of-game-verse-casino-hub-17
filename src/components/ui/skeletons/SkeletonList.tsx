import { Skeleton } from '../skeleton';
import { cn } from '@/lib/utils';
import { SkeletonMatchCard, SkeletonCompactCard } from './SkeletonCard';

interface SkeletonListProps {
  className?: string;
  /** Nombre d'items à afficher */
  count?: number;
  /** Type de skeleton item */
  variant?: 'default' | 'match' | 'compact' | 'transaction';
  /** Afficher un diviseur entre les items */
  divided?: boolean;
}

/**
 * Skeleton pour les listes
 */
export function SkeletonList({
  className,
  count = 5,
  variant = 'default',
  divided = true,
}: SkeletonListProps) {
  const renderItem = (index: number) => {
    switch (variant) {
      case 'match':
        return <SkeletonMatchCard key={index} />;
      case 'compact':
        return <SkeletonCompactCard key={index} />;
      case 'transaction':
        return <SkeletonTransactionItem key={index} />;
      default:
        return <SkeletonListItem key={index} />;
    }
  };

  return (
    <div 
      className={cn(
        'animate-in fade-in duration-300',
        divided && 'divide-y divide-border',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => renderItem(i))}
    </div>
  );
}

/**
 * Item de liste par défaut
 */
function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  );
}

/**
 * Item de transaction
 */
function SkeletonTransactionItem() {
  return (
    <div className="flex items-center justify-between py-3 px-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="h-4 w-16 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour liste horizontale scrollable
 */
export function SkeletonHorizontalList({
  className,
  count = 4,
  itemWidth = 'w-32',
  itemHeight = 'h-40',
}: {
  className?: string;
  count?: number;
  itemWidth?: string;
  itemHeight?: string;
}) {
  return (
    <div className={cn('flex gap-3 overflow-hidden', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn('shrink-0 rounded-lg', itemWidth, itemHeight)} 
        />
      ))}
    </div>
  );
}
