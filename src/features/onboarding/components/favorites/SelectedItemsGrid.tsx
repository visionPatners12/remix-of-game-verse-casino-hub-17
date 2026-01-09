import { useTranslation } from 'react-i18next';
import { X, Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectedItem {
  id: string;
  name: string;
  logo?: string;
  country?: string;
  sport?: {
    id: string;
    name: string;
    icon?: ComponentType<{ className?: string }>;
  };
}

interface SelectedItemsGridProps {
  items: SelectedItem[];
  onRemove: (id: string) => void;
  disabled?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  itemLabel?: string;
  maxCount?: number;
  className?: string;
}

export const SelectedItemsGrid = ({
  items,
  onRemove,
  disabled = false,
  emptyTitle,
  emptySubtitle,
  itemLabel = "items",
  maxCount = 5,
  className
}: SelectedItemsGridProps) => {
  const { t } = useTranslation('auth');
  
  const displayEmptyTitle = emptyTitle || t('onboarding.steps.favoriteLeagues.noLeaguesSelected');
  const displayEmptySubtitle = emptySubtitle || t('onboarding.steps.favoriteLeagues.searchSubtitle');
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          {t('onboarding.steps.common.yourSelection')}
        </h4>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          items.length > 0 
            ? "bg-primary/10 text-primary border border-primary/20" 
            : "bg-muted text-muted-foreground"
        )}>
          {items.length}/{maxCount}
        </div>
      </div>
      
      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10 px-6 rounded-2xl border-2 border-dashed border-border/60 bg-gradient-to-br from-muted/20 to-muted/40"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/60 flex items-center justify-center">
            <Search className="w-5 h-5 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {displayEmptyTitle}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {displayEmptySubtitle}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const SportIcon = item.sport?.icon;
              
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "relative group p-3 rounded-xl",
                    "bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5",
                    "border border-primary/20 hover:border-primary/40",
                    "shadow-sm hover:shadow-md",
                    "transition-all duration-200",
                    disabled && "opacity-50 pointer-events-none"
                  )}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemove(item.id)}
                    disabled={disabled}
                    className={cn(
                      "absolute -top-2 -right-2 z-10",
                      "w-6 h-6 rounded-full",
                      "bg-destructive/90 hover:bg-destructive",
                      "flex items-center justify-center",
                      "text-destructive-foreground",
                      "shadow-md",
                      "opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-150",
                      "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive/50",
                      disabled && "cursor-not-allowed"
                    )}
                    aria-label={`Remove ${item.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="w-10 h-10 rounded-lg bg-white/90 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt={`${item.name} logo`}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-sm font-bold text-primary">${item.name.charAt(0)}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {item.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {SportIcon && (
                          <SportIcon className="w-3 h-3 text-muted-foreground" />
                        )}
                        {item.sport?.name && (
                          <span className="text-xs text-muted-foreground truncate">
                            {item.sport.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
