import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { OnboardingStepProps } from '@/features/onboarding/types';
import { useFavoriteSports } from '@/features/onboarding/hooks';
import { FavoriteStepLayout } from '../favorites/FavoriteStepLayout';
import { SelectionGrid } from '../favorites/SelectionGrid';
import { MobileSportSelection } from '../favorites/MobileSportSelection';
import { useOnboardingSports } from '@/features/onboarding/hooks/useOnboardingSports';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';


const MAX_SPORTS = 5;

export function FavoriteSportStep({ onNext, onBack }: OnboardingStepProps) {
  const { data: sports = [], isLoading: sportsLoading, refetch } = useOnboardingSports();
  const { favoriteSports, addFavorite, removeFavorite, isAdding, isRemoving } = useFavoriteSports();
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    setSelectedSports(favoriteSports);
  }, [favoriteSports]);

  const handleSportToggle = async (sportId: string) => {
    const isSelected = selectedSports.includes(sportId);
    
    try {
      if (isSelected) {
        // Remove from selection
        setSelectedSports(prev => prev.filter(id => id !== sportId));
        await removeFavorite(sportId);
      } else {
        // Add to selection
        setSelectedSports(prev => [...prev, sportId]);
        await addFavorite(sportId);
      }
    } catch (error) {
      // Revert UI change on error
      console.error('Error toggling sport:', error);
      toast.error('Error saving');
    }
  };

  const handleContinue = async () => {
    try {
      toast.success('Sports saved!');
      onNext?.();
    } catch (error) {
      console.error('Error continuing:', error);
      toast.error('Error saving');
    }
  };

  const isLoading = isAdding || isRemoving;
  const canContinue = selectedSports.length > 0;
  
  // Les sports sont déjà au bon format depuis useOnboardingSports
  const sportItems = sports;

  // Fallback UI if no sports are loaded
  if (!sportsLoading && sports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-foreground">No sports available</h2>
          <p className="text-muted-foreground">
            Unable to load sports list.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          className="gap-2"
          size="lg"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  // Mobile-first responsive rendering
  if (isMobile) {
    return (
      <MobileSportSelection
        sports={sportItems}
        selectedIds={selectedSports}
        onToggle={handleSportToggle}
        maxSelections={MAX_SPORTS}
        isLoading={isLoading}
        onContinue={handleContinue}
        onBack={onBack}
        canContinue={canContinue}
      />
    );
  }

  // Desktop fallback
  return (
    <>
      <FavoriteStepLayout
        title="Favorite sports"
        subtitle="Select up to 5 sports you're interested in"
        selectedCount={selectedSports.length}
        maxCount={MAX_SPORTS}
        isLoading={isLoading}
        onContinue={handleContinue}
        canContinue={canContinue}
        onBack={onBack}
      >
        <SelectionGrid
          items={sportItems}
          selectedIds={selectedSports}
          onToggle={handleSportToggle}
          maxSelections={MAX_SPORTS}
          loading={sportsLoading}
          variant="grid"
        />
      </FavoriteStepLayout>
    </>
  );
}