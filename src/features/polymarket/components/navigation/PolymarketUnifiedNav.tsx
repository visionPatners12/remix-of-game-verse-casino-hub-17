import React, { useRef, useEffect } from 'react';
import { ChevronDown, TrendingUp, Sparkles, Zap, Landmark, Trophy, Bitcoin, Globe, Cpu, Film, Earth, TrendingUpIcon } from 'lucide-react';
import { PolymarketTab, PolymarketSubcategory } from '../../types/feed';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface Props {
  activeTab: PolymarketTab;
  activeCategory: string | null;
  activeSubcategory: string | null;
  subcategories: PolymarketSubcategory[];
  isSheetOpen: boolean;
  onOpenSheet: () => void;
  onSubcategorySelect: (id: string | null) => void;
  onFilterSelect?: (category: string | null, subcategory: string | null) => void;
}

const tabConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  trending: { label: 'Trending', icon: TrendingUp, color: 'text-orange-500' },
  new: { label: 'New', icon: Sparkles, color: 'text-purple-500' },
  breaking: { label: 'Breaking', icon: Zap, color: 'text-red-500' },
};

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  politics: { label: 'Politics', icon: Landmark, color: 'text-blue-500' },
  sports: { label: 'Sports', icon: Trophy, color: 'text-green-500' },
  crypto: { label: 'Crypto', icon: Bitcoin, color: 'text-yellow-500' },
  geopolitics: { label: 'Geopolitics', icon: Globe, color: 'text-slate-500' },
  tech: { label: 'Tech', icon: Cpu, color: 'text-cyan-500' },
  culture: { label: 'Culture', icon: Film, color: 'text-pink-500' },
  world: { label: 'World', icon: Earth, color: 'text-emerald-500' },
  economy: { label: 'Economy', icon: TrendingUpIcon, color: 'text-indigo-500' },
};

export const PolymarketUnifiedNav: React.FC<Props> = ({
  activeTab,
  activeCategory,
  activeSubcategory,
  subcategories,
  isSheetOpen,
  onOpenSheet,
  onSubcategorySelect,
  onFilterSelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const { scrollDirection, isAtTop } = useScrollDirection({ threshold: 10 });

  const isHidden = scrollDirection === 'down' && !isAtTop && !isSheetOpen;

  const getActiveConfig = () => {
    if (activeCategory && categoryConfig[activeCategory]) {
      return categoryConfig[activeCategory];
    }
    return tabConfig[activeTab] || tabConfig.trending;
  };

  const config = getActiveConfig();
  const Icon = config.icon;
  const hasSubcategories = activeCategory && subcategories.length > 0;

  // Scroll to active chip on mount/change
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const activeChip = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const chipRect = activeChip.getBoundingClientRect();
      
      const scrollLeft = chipRect.left - containerRect.left - 16;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeSubcategory]);

  return (
    <motion.div 
      className="fixed left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border"
      style={{ top: 'calc(3.5rem + var(--safe-area-inset-top, 0px))' }}
      initial={false}
      animate={{ 
        y: isHidden ? -60 : 0,
        opacity: isHidden ? 0 : 1
      }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Category/Tab selector button */}
        <button
          onClick={onOpenSheet}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors active:scale-95"
        >
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className="font-medium text-sm whitespace-nowrap">{config.label}</span>
          <motion.div
            animate={{ rotate: isSheetOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </motion.div>
        </button>

        {/* Divider & Subcategory chips - hidden when sheet is open */}
        <AnimatePresence mode="wait">
          {hasSubcategories && !isSheetOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              {/* Divider */}
              <div className="w-px h-5 bg-border flex-shrink-0" />

              {/* Subcategory chips - scrollable */}
              <div 
                ref={scrollRef}
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {/* All chip */}
                <motion.button
                  ref={!activeSubcategory ? activeRef : undefined}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    if (onFilterSelect) {
                      onFilterSelect(activeCategory, null);
                    } else {
                      onSubcategorySelect(null);
                    }
                  }}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all snap-start ${
                    !activeSubcategory
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  All
                </motion.button>

                {/* Subcategory chips */}
                {subcategories.map((sub, index) => {
                  const isActive = activeSubcategory === sub.id;
                  return (
                    <motion.button
                      key={sub.id}
                      ref={isActive ? activeRef : undefined}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => {
                        if (onFilterSelect) {
                          onFilterSelect(activeCategory, sub.id);
                        } else {
                          onSubcategorySelect(sub.id);
                        }
                      }}
                      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all snap-start whitespace-nowrap ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {sub.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
