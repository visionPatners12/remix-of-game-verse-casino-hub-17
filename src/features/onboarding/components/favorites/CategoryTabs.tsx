import { cn } from '@/lib/utils';

export interface CategoryInfo {
  key: string;
  label: string;
  count: number;
}

interface CategoryTabsProps {
  categories: CategoryInfo[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryTabs = ({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) => {
  if (categories.length <= 1) return null;

  return (
    <div className="px-4 mb-4">
      <div className="bg-muted/50 p-1 rounded-2xl flex">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => onCategoryChange(category.key)}
            className={cn(
              "flex-1 h-9 rounded-xl text-sm font-medium transition-all duration-200 focus-ring",
              "flex items-center justify-center gap-1.5",
              activeCategory === category.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{category.label}</span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              activeCategory === category.key
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}>
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};