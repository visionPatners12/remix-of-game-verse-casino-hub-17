import React, { memo, Suspense } from 'react';
import { FeedDataProvider } from '../../../context/FeedDataContext';
import { ForYouFeed } from '../../foryou/ForYouFeed';
import { HighlightsSection } from '@/features/highlights';
import { BetsView } from '../views/BetsView';
import { FeedSkeleton } from '../../shared/FeedSkeleton';
import type { FeedFilter } from '@/types/feed/state';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

// Lazy load views with retry for better reliability
const ForecastsView = lazyWithRetry(() => import('../views/ForecastsView').then(m => ({ default: m.ForecastsView })));
const TrendingView = lazyWithRetry(() => import('../views/TrendingView').then(m => ({ default: m.TrendingView })));
const LiveView = lazyWithRetry(() => import('../views/LiveView').then(m => ({ default: m.LiveView })));

interface FeedContentProps {
  filter: FeedFilter;
}

// Views that need the shared FeedDataContext
const FILTERED_VIEWS = ['orders', 'forecasts'] as const;

const ForYouView = memo(function ForYouView() {
  return (
    <div className="max-w-2xl mx-auto">
      <FeedDataProvider limit={100}>
        <ForYouFeed />
      </FeedDataProvider>
    </div>
  );
});

const HighlightsView = memo(function HighlightsView() {
  return (
    <div className="max-w-6xl mx-auto">
      <HighlightsSection />
    </div>
  );
});

// Component that renders content that needs the FeedDataProvider
const FilteredFeedContent = memo(function FilteredFeedContent({ filter }: { filter: 'orders' | 'forecasts' }) {
  if (filter === 'orders') {
    return <BetsView />;
  }
  
  return (
    <Suspense fallback={<FeedSkeleton count={3} />}>
      <ForecastsView />
    </Suspense>
  );
});

const FeedContent = memo(function FeedContent({ filter }: FeedContentProps) {
  const isFilteredView = FILTERED_VIEWS.includes(filter as typeof FILTERED_VIEWS[number]);
  const isLazyComponent = ['trending', 'live'].includes(filter);

  // For filtered views (bets/predictions), wrap with FeedDataProvider
  if (isFilteredView) {
    return (
      <div className="gpu-accelerated pt-4">
        <FeedDataProvider limit={50}>
          <FilteredFeedContent filter={filter as 'orders' | 'forecasts'} />
        </FeedDataProvider>
      </div>
    );
  }

  // For lazy components (trending, live)
  if (isLazyComponent) {
    const LazyComponent = filter === 'trending' ? TrendingView : LiveView;
    return (
      <div className="gpu-accelerated pt-4">
        <Suspense fallback={<FeedSkeleton count={3} />}>
          <LazyComponent />
        </Suspense>
      </div>
    );
  }

  // For foryou
  if (filter === 'foryou') {
    return (
      <div className="gpu-accelerated pt-4">
        <ForYouView />
      </div>
    );
  }

  // For highlights
  if (filter === 'highlights') {
    return (
      <div className="gpu-accelerated pt-4">
        <HighlightsView />
      </div>
    );
  }

  // Default fallback
  return (
    <div className="gpu-accelerated pt-4">
      <ForYouView />
    </div>
  );
});

FeedContent.displayName = 'FeedContent';
ForYouView.displayName = 'ForYouView';
FilteredFeedContent.displayName = 'FilteredFeedContent';

export { FeedContent };
