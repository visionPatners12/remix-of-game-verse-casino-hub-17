import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { OnboardingStepProps } from '@/features/onboarding/types';
import { useFavoriteLeagues } from '@/features/onboarding/hooks';
import { FavoriteStepLayout } from '../../favorites/FavoriteStepLayout';
import { SelectedItemsGrid } from '../../favorites/SelectedItemsGrid';
import { getSportIcon } from '@/lib/sportIconsLite';
import { LeagueSearchForOnboarding } from './LeagueSearchForOnboarding';

const MAX_LEAGUES = 5;

export function FavoriteLeaguesStep({ onNext, onBack }: OnboardingStepProps) {
  const { t } = useTranslation('auth');
  const { favoriteLeagues, favoriteLeaguesData, addFavorite, removeFavorite, isAdding, isRemoving } = useFavoriteLeagues();
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);

  useEffect(() => {
    setSelectedLeagues(favoriteLeagues);
  }, [favoriteLeagues]);

  const handleLeagueToggle = async (leagueId: string) => {
    const isSelected = selectedLeagues.includes(leagueId);
    
    try {
      if (isSelected) {
        setSelectedLeagues(prev => prev.filter(id => id !== leagueId));
        await removeFavorite(leagueId);
      } else {
        if (selectedLeagues.length >= MAX_LEAGUES) {
          toast.error(t('onboarding.steps.favoriteLeagues.maxError', { max: MAX_LEAGUES }));
          return;
        }
        setSelectedLeagues(prev => [...prev, leagueId]);
        await addFavorite(leagueId);
      }
    } catch (error) {
      console.error('Error toggling league:', error);
      toast.error(t('onboarding.steps.common.savingError'));
    }
  };

  const handleContinue = async () => {
    try {
      toast.success(t('onboarding.steps.favoriteLeagues.success'));
      onNext?.();
    } catch (error) {
      console.error('Error continuing:', error);
      toast.error(t('onboarding.steps.common.savingError'));
    }
  };

  const isLoading = isAdding || isRemoving;

  const formattedLeagues = favoriteLeaguesData.map(league => ({
    ...league,
    sport: league.sport ? {
      id: league.sport.id,
      name: league.sport.name,
      icon: getSportIcon(league.sport.icon_name)
    } : undefined
  }));

  return (
    <FavoriteStepLayout
      title={t('onboarding.steps.favoriteLeagues.title')}
      subtitle={t('onboarding.steps.favoriteLeagues.subtitle', { max: MAX_LEAGUES })}
      selectedCount={selectedLeagues.length}
      maxCount={MAX_LEAGUES}
      isLoading={isLoading}
      onContinue={handleContinue}
      canContinue={true}
      onBack={onBack}
      searchComponent={
        <LeagueSearchForOnboarding
          selectedLeagueIds={selectedLeagues}
          onLeagueToggle={handleLeagueToggle}
          maxSelections={MAX_LEAGUES}
          disabled={isLoading}
        />
      }
    >
      <SelectedItemsGrid
        items={formattedLeagues}
        onRemove={handleLeagueToggle}
        disabled={isLoading}
        emptyTitle={t('onboarding.steps.favoriteLeagues.noLeaguesSelected')}
        emptySubtitle={t('onboarding.steps.favoriteLeagues.searchSubtitle')}
        itemLabel="leagues"
        maxCount={MAX_LEAGUES}
      />
    </FavoriteStepLayout>
  );
}
