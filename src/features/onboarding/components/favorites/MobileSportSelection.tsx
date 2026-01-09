import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SportChip } from './SportChip';
import { SelectedSportsPanel } from './SelectedSportsPanel';
import { CategoryTabs, CategoryInfo } from './CategoryTabs';
import { cn } from '@/lib/utils';
import { ComponentType } from 'react';

interface MobileSportSelectionProps {
  sports: Array<{
    id: string;
    name: string;
    icon?: ComponentType<any>;
    category: string;
  }>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSelections: number;
  isLoading: boolean;
  onContinue: () => void;
  onBack: () => void;
  canContinue: boolean;
}

export const MobileSportSelection = ({
  sports,
  selectedIds,
  onToggle,
  maxSelections,
  isLoading,
  onContinue,
  onBack,
  canContinue,
}: MobileSportSelectionProps) => {
  const { t } = useTranslation('auth');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Calculer les catégories disponibles avec compteurs
  const categories = useMemo((): CategoryInfo[] => {
    const categoryCount = sports.reduce((acc, sport) => {
      const category = sport.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryLabels: Record<string, string> = {
      'sports': 'Sports',
      'esports': 'Esports', 
      'special': 'Special',
      'other': 'Other'
    };

    const categoriesWithAll = [
      { key: 'all', label: 'All', count: sports.length },
      ...Object.entries(categoryCount).map(([key, count]) => ({
        key,
        label: categoryLabels[key] || key.charAt(0).toUpperCase() + key.slice(1),
        count
      }))
    ];

    return categoriesWithAll.filter(cat => cat.count > 0);
  }, [sports]);

  // Filtrer les sports par catégorie
  const filteredSports = useMemo(() => {
    return sports.filter(sport => {
      const matchesCategory = activeCategory === 'all' || sport.category === activeCategory;
      return matchesCategory;
    });
  }, [sports, activeCategory]);

  const selectedSports = sports.filter(sport => selectedIds.includes(sport.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col relative safe-area-top">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/20">
        <div className="flex items-center px-4 py-3">
          <Button variant="ghost" size="lg" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-semibold text-foreground">
              {t('onboarding.steps.favoriteSport.title')}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
            </div>
          </div>
          
          <div className="w-[44px]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-2 pb-safe overflow-y-auto">
        <p className="text-xs text-muted-foreground text-center mb-3">
          {t('onboarding.steps.favoriteSport.subtitle', { max: maxSelections })}
        </p>

        {/* Selected Sports Panel */}
        <SelectedSportsPanel
          selectedSports={selectedSports}
          onRemove={onToggle}
          maxCount={maxSelections}
        />

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Sports Grid */}
        <div className="pb-32">
          <div className="grid grid-cols-3 gap-x-1.5 gap-y-2.5">
            {filteredSports.map((sport) => (
              <SportChip
                key={sport.id}
                id={sport.id}
                name={sport.name}
                icon={sport.icon}
                isSelected={selectedIds.includes(sport.id)}
                onToggle={onToggle}
                disabled={!selectedIds.includes(sport.id) && selectedIds.length >= maxSelections}
              />
            ))}
          </div>
          
          {filteredSports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                {t('onboarding.steps.favoriteSport.noSportsInCategory')}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent p-4 border-t border-border/50">
        <Button
          onClick={onContinue}
          disabled={!canContinue || isLoading}
          className="w-full h-14 text-base font-medium rounded-2xl focus-ring"
          size="lg"
        >
          {isLoading ? t('onboarding.steps.favoriteSport.saving') : `${t('onboarding.steps.favoriteSport.continue')} (${selectedIds.length}/${maxSelections})`}
        </Button>
        
        <button className="w-full text-center text-[13px] text-muted-foreground mt-3 hover:text-foreground transition-colors focus-ring rounded px-2 py-1">
          {t('onboarding.steps.favoriteSport.skip')}
        </button>
        
        <div className="h-6" /> {/* Safe area for gesture bar */}
      </div>
    </div>
  );
};
