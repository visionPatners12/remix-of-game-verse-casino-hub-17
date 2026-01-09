import React, { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { 
  TrendingUp, Sparkles, Zap, Landmark, Trophy, Bitcoin, Globe, Cpu, Film, Earth, 
  TrendingUpIcon, Loader2, Banknote, DollarSign, User, Vote, ChevronRight, Check
} from 'lucide-react';
import { PolymarketTab } from '../../types/feed';
import { motion, AnimatePresence } from 'framer-motion';
import { usePolymarketCategories, usePolymarketSubcategories } from '../../hooks/queries/usePolymarketCategories';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: PolymarketTab;
  activeCategory: string | null;
  activeSubcategory: string | null;
  onTabSelect: (tab: PolymarketTab) => void;
  onCategorySelect: (slug: string | null) => void;
  onSubcategorySelect: (id: string | null) => void;
  onFilterSelect?: (category: string | null, subcategory: string | null) => void;
}

const discoverTabs: { id: PolymarketTab; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'new', label: 'New', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'breaking', label: 'Breaking', icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10' },
];

const categoryIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  politics: { icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  sports: { icon: Trophy, color: 'text-green-500', bg: 'bg-green-500/10' },
  crypto: { icon: Bitcoin, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  geopolitics: { icon: Globe, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  tech: { icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  culture: { icon: Film, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  world: { icon: Earth, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  economy: { icon: TrendingUpIcon, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  science: { icon: Cpu, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  finance: { icon: Banknote, color: 'text-green-600', bg: 'bg-green-600/10' },
  earnings: { icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  trump: { icon: User, color: 'text-red-500', bg: 'bg-red-500/10' },
  elections: { icon: Vote, color: 'text-purple-600', bg: 'bg-purple-600/10' },
};

const defaultIconConfig = { icon: Globe, color: 'text-gray-500', bg: 'bg-gray-500/10' };

export const PolymarketCategorySheet: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  activeTab,
  activeCategory,
  activeSubcategory,
  onTabSelect,
  onCategorySelect,
  onSubcategorySelect,
  onFilterSelect,
}) => {
  const { data: categories = [], isLoading } = usePolymarketCategories();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Sync expanded category with activeCategory when modal opens
  useEffect(() => {
    if (isOpen && activeCategory) {
      setExpandedCategory(activeCategory);
    }
  }, [isOpen, activeCategory]);

  // Get subcategories for expanded category
  const expandedCategoryData = categories.find(c => c.slug === expandedCategory);
  const { data: subcategories = [], isLoading: isLoadingSubcategories } = usePolymarketSubcategories(
    expandedCategoryData?.tag_id || ''
  );

  // Handle discover tab click - select tab and close modal
  const handleTabClick = (tabId: PolymarketTab) => {
    onTabSelect(tabId);
    onCategorySelect(null);
    onSubcategorySelect(null);
    onOpenChange(false);
  };

  // Handle category row click - expand/collapse subcategories
  const handleCategoryRowClick = (slug: string | null) => {
    if (expandedCategory === slug) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(slug);
    }
  };

  // Handle "All [Category]" click - select category, clear subcategory, close modal
  const handleSelectCategory = (slug: string | null) => {
    if (onFilterSelect) {
      onFilterSelect(slug, null);
    } else {
      onCategorySelect(slug);
      onSubcategorySelect(null);
    }
    onOpenChange(false);
  };

  // Handle subcategory click - select both category and subcategory, close modal
  const handleSelectSubcategory = (categorySlug: string | null, subcategoryId: string) => {
    if (onFilterSelect) {
      onFilterSelect(categorySlug, subcategoryId);
    } else {
      onCategorySelect(categorySlug);
      onSubcategorySelect(subcategoryId);
    }
    onOpenChange(false);
  };

  // Handle clear filter
  const handleClearFilter = () => {
    onCategorySelect(null);
    onSubcategorySelect(null);
    onOpenChange(false);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange} modal>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Drawer.Content 
          className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl outline-none max-h-[85vh] flex flex-col"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">Filter categories</Drawer.Title>
          <div className="p-4 flex-shrink-0">
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Discover Section */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Discover
              </h3>
              <div className="flex gap-2">
                {discoverTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id && !activeCategory;
                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleTabClick(tab.id)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                        isActive 
                          ? `${tab.bg} ring-2 ring-offset-2 ring-offset-background ring-primary/50` 
                          : 'bg-muted/50 hover:bg-muted active:scale-95'
                      )}
                    >
                      <Icon className={`w-5 h-5 ${tab.color}`} />
                      <span className={cn(
                        "text-xs font-medium",
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {tab.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Categories Section with Accordion */}
          <div className="flex-1 overflow-hidden px-4 pb-safe">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Categories
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[calc(85vh-220px)]">
                <div className="space-y-1 pr-4">
                  {categories.map((category, index) => {
                    const iconConfig = categoryIcons[category.slug || ''] || defaultIconConfig;
                    const Icon = iconConfig.icon;
                    const isActive = activeCategory === category.slug;
                    const isExpanded = expandedCategory === category.slug;

                    return (
                      <motion.div
                        key={category.tag_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + index * 0.02 }}
                      >
                        {/* Category Row */}
                        <button
                          onClick={() => handleCategoryRowClick(category.slug || null)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                            isActive && !activeSubcategory
                              ? `${iconConfig.bg} ring-1 ring-primary/30` 
                              : 'hover:bg-muted/50 active:scale-[0.98]'
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center",
                            iconConfig.bg
                          )}>
                            <Icon className={`w-5 h-5 ${iconConfig.color}`} />
                          </div>
                          <span className={cn(
                            "flex-1 text-sm font-medium text-left",
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          )}>
                            {category.label}
                          </span>
                          {isActive && !activeSubcategory && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </motion.div>
                        </button>

                        {/* Subcategories */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pl-12 pr-2 py-2 space-y-1">
                                {/* All in category option */}
                                <button
                                  onClick={() => handleSelectCategory(category.slug || null)}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                                    isActive && !activeSubcategory
                                      ? 'bg-primary text-primary-foreground'
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                  )}
                                >
                                  <span>All {category.label}</span>
                                  {isActive && !activeSubcategory && (
                                    <Check className="w-3.5 h-3.5 ml-auto" />
                                  )}
                                </button>

                                {isLoadingSubcategories ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                  </div>
                                ) : (
                                  subcategories.map((sub) => {
                                    const isSubActive = activeSubcategory === sub.id;
                                    return (
                                      <button
                                        key={sub.id}
                                        onClick={() => handleSelectSubcategory(category.slug || null, sub.id)}
                                        className={cn(
                                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                                          isSubActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        )}
                                      >
                                        <span>{sub.label}</span>
                                        {isSubActive && (
                                          <Check className="w-3.5 h-3.5 ml-auto" />
                                        )}
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Clear Selection */}
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 pt-2 flex-shrink-0"
            >
              <button
                onClick={handleClearFilter}
                className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/50"
              >
                Clear filter
              </button>
            </motion.div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
