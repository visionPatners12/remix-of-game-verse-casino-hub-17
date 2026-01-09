import { SelectionCard } from './SelectionCard';

interface SelectionItem {
  id: string;
  name: string;
  logo?: string;
  description?: string;
}

interface SelectionGridProps {
  items: SelectionItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSelections: number;
  loading?: boolean;
  variant?: 'grid' | 'list';
  className?: string;
}

export const SelectionGrid = ({
  items,
  selectedIds,
  onToggle,
  maxSelections,
  loading = false,
  variant = 'grid',
  className,
}: SelectionGridProps) => {
  if (loading) {
    return (
      <div className={`${
        variant === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-4 gap-4' 
          : 'space-y-3'
      } ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-border/60 bg-card animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted/60" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted/60 rounded w-3/4" />
                <div className="h-3 bg-muted/60 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${
      variant === 'grid' 
        ? 'grid grid-cols-2 md:grid-cols-4 gap-4' 
        : 'space-y-3'
    } ${className}`}>
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        const isDisabled = !isSelected && selectedIds.length >= maxSelections;

        return (
          <SelectionCard
            key={item.id}
            id={item.id}
            name={item.name}
            logo={item.logo}
            description={item.description}
            isSelected={isSelected}
            onToggle={onToggle}
            disabled={isDisabled}
          />
        );
      })}
    </div>
  );
};