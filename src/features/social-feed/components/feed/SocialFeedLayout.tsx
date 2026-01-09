import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePersistedState } from '@/hooks/base';
import { MobileFeedLayout } from './layouts/MobileFeedLayout';
import { DesktopFeedLayout } from './layouts/DesktopFeedLayout';

export function SocialFeedLayout() {
  const isMobile = useIsMobile();
  const { state, actions } = usePersistedState<'foryou' | 'orders' | 'forecasts' | 'highlights' | 'trending' | 'live'>({
    key: 'feed-selected-filter',
    initialValue: 'foryou',
  });
  
  
  const selectedFilter = state.value;
  const setSelectedFilter = actions.setValue;

  if (isMobile) {
    return (
      <MobileFeedLayout 
        selectedFilter={selectedFilter}
        onFilterSelect={setSelectedFilter}
      />
    );
  }

  return (
    <DesktopFeedLayout 
      selectedFilter={selectedFilter}
      onFilterSelect={setSelectedFilter}
      showRightPanel={!isMobile}
    />
  );
}
