import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Flame, Users, Sparkles, Dices, Zap, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All', icon: Gamepad2 },
  { id: 'popular', label: 'Popular', icon: Flame },
  { id: 'multiplayer', label: 'Multi', icon: Users },
  { id: 'slots', label: 'Slots', icon: Sparkles },
  { id: 'table', label: 'Table', icon: Dices },
  { id: 'instant', label: 'Instant', icon: Zap },
];

interface CategoriesTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoriesTabs: React.FC<CategoriesTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 hide-scrollbar -mx-3 px-3">
      {CATEGORIES.map((cat, index) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap',
              'transition-all duration-200 font-medium text-xs',
              'border',
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                : 'bg-card/50 hover:bg-card text-muted-foreground border-border/50 hover:border-border'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {cat.label}
          </motion.button>
        );
      })}
    </div>
  );
};
