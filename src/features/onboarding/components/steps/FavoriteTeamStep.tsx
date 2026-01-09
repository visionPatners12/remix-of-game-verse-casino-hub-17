import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { OnboardingStepProps } from '@/features/onboarding/types';
import { useFavoriteTeams } from '@/features/onboarding/hooks';
import { FavoriteStepLayout } from '../favorites/FavoriteStepLayout';
import { SelectedItemsGrid } from '../favorites/SelectedItemsGrid';
import { TeamSearchForOnboarding } from './FavoriteTeamStep/TeamSearchForOnboarding';
import { getSportIcon } from '@/lib/sportIcons';

const MAX_TEAMS = 5;

export function FavoriteTeamStep({ onNext, onBack }: OnboardingStepProps) {
  const { t } = useTranslation('auth');
  const { favoriteTeams, favoriteTeamsData, addFavorite, removeFavorite, isAdding, isRemoving } = useFavoriteTeams();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  useEffect(() => {
    setSelectedTeams(favoriteTeams);
  }, [favoriteTeams]);

  const handleTeamToggle = async (teamId: string) => {
    const isSelected = selectedTeams.includes(teamId);
    
    try {
      if (isSelected) {
        setSelectedTeams(prev => prev.filter(id => id !== teamId));
        await removeFavorite(teamId);
      } else {
        if (selectedTeams.length >= MAX_TEAMS) {
          toast.error(t('onboarding.steps.favoriteTeams.maxError', { max: MAX_TEAMS }));
          return;
        }
        setSelectedTeams(prev => [...prev, teamId]);
        await addFavorite(teamId);
      }
    } catch (error) {
      console.error('Error toggling team:', error);
      toast.error(t('onboarding.steps.common.savingError'));
    }
  };

  const handleContinue = async () => {
    try {
      toast.success(t('onboarding.steps.favoriteTeams.success'));
      onNext?.();
    } catch (error) {
      console.error('Error continuing:', error);
      toast.error(t('onboarding.steps.common.savingError'));
    }
  };

  const isLoading = isAdding || isRemoving;

  const formattedTeams = favoriteTeamsData.map(team => ({
    ...team,
    sport: team.sport ? {
      id: team.sport.id,
      name: team.sport.name,
      icon: getSportIcon(team.sport.icon_name)
    } : undefined
  }));

  return (
    <FavoriteStepLayout
      title={t('onboarding.steps.favoriteTeams.title')}
      subtitle={t('onboarding.steps.favoriteTeams.subtitle', { max: MAX_TEAMS })}
      selectedCount={selectedTeams.length}
      maxCount={MAX_TEAMS}
      isLoading={isLoading}
      onContinue={handleContinue}
      canContinue={true}
      onBack={onBack}
      searchComponent={
        <TeamSearchForOnboarding
          selectedTeamIds={selectedTeams}
          onTeamToggle={handleTeamToggle}
          maxSelections={MAX_TEAMS}
          disabled={isLoading}
        />
      }
    >
      <SelectedItemsGrid
        items={formattedTeams}
        onRemove={handleTeamToggle}
        disabled={isLoading}
        emptyTitle={t('onboarding.steps.favoriteTeams.noTeamsSelected')}
        emptySubtitle={t('onboarding.steps.favoriteTeams.searchSubtitle')}
        itemLabel="teams"
        maxCount={MAX_TEAMS}
      />
    </FavoriteStepLayout>
  );
}
