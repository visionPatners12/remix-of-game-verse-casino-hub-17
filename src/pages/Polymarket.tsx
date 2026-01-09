import React, { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PolymarketMobileFeed } from '@/features/polymarket';
import { PolymarketUnifiedNav } from '@/features/polymarket/components/navigation/PolymarketUnifiedNav';
import { PolymarketCategorySheet } from '@/features/polymarket/components/navigation/PolymarketCategorySheet';
import { usePolymarketInfiniteFeed } from '@/features/polymarket/hooks/queries/usePolymarketInfiniteFeed';
import { PolymarketTab } from '@/features/polymarket/types/feed';
import { useFullscreen } from '@/contexts/FullscreenContext';
import { PolymarketSEOHead } from '@/components/seo/PolymarketSEOHead';
import { buildPolymarketEventUrl } from '@/features/polymarket/utils/seoUrls';

export default function Polymarket() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { enterFullscreen, exitFullscreen } = useFullscreen();

  // Synchronize sheet state with fullscreen context to hide bottom navbar
  const handleSheetOpenChange = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (open) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);
  
  const tab = (searchParams.get('tab') as PolymarketTab) || 'trending';
  const categorySlug = searchParams.get('category');
  const subcategorySlug = searchParams.get('sub');
  
  const { 
    data, 
    isLoading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage 
  } = usePolymarketInfiniteFeed({
    tab,
    categorySlug,
    subcategorySlug,
  });

  // Flatten pages into single array
  const events = data?.pages.flatMap(page => page.data) ?? [];
  const subcategories = data?.pages[0]?.subcategories ?? [];
  
  console.log('[Polymarket] Feed state:', { 
    pagesCount: data?.pages?.length, 
    totalEvents: events.length,
    hasNextPage,
    isFetchingNextPage 
  });

  // Combined handler to update category AND subcategory in a single setSearchParams call
  const handleFilterSelect = useCallback((categorySlug: string | null, subId: string | null) => {
    const newParams = new URLSearchParams();
    
    if (categorySlug) {
      newParams.set('category', categorySlug);
    }
    if (subId) {
      newParams.set('sub', subId);
    }
    
    setSearchParams(newParams);
  }, [setSearchParams]);

  const handleTabSelect = (tabId: PolymarketTab) => {
    const newParams = new URLSearchParams();
    newParams.set('tab', tabId);
    setSearchParams(newParams);
  };

  const handleCategorySelect = (slug: string | null) => {
    handleFilterSelect(slug, null);
  };

  const handleSubcategorySelect = (subId: string | null) => {
    const currentCategory = searchParams.get('category');
    handleFilterSelect(currentCategory, subId);
  };

  const handleView = (params: { 
    marketId: string; 
    side: 'YES' | 'NO'; 
    eventTitle: string;
    marketQuestion: string;
  }) => {
    console.log('View market details:', params);
  };

  const handleOpenDetails = (eventId: string, eventTitle?: string) => {
    navigate(buildPolymarketEventUrl({ id: eventId, title: eventTitle }));
  };

  return (
    <Layout>
      <PolymarketSEOHead 
        tab={tab}
        category={categorySlug}
        subcategory={subcategorySlug}
      />
      <div className="space-y-0">
        {/* Unified Navigation - Category + Subcategories on same line */}
        <PolymarketUnifiedNav
          activeTab={tab}
          activeCategory={categorySlug}
          activeSubcategory={subcategorySlug}
          subcategories={subcategories}
          isSheetOpen={isSheetOpen}
          onOpenSheet={() => handleSheetOpenChange(true)}
          onSubcategorySelect={handleSubcategorySelect}
          onFilterSelect={handleFilterSelect}
        />

        {/* Category Sheet */}
        <PolymarketCategorySheet
          isOpen={isSheetOpen}
          onOpenChange={handleSheetOpenChange}
          activeTab={tab}
          activeCategory={categorySlug}
          activeSubcategory={subcategorySlug}
          onTabSelect={handleTabSelect}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          onFilterSelect={handleFilterSelect}
        />
        
        {/* Spacer - now only 48px since everything is on one line */}
        <div className="pt-[48px]" />
        
        <PolymarketMobileFeed
          events={events}
          isLoading={isLoading}
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          onView={handleView}
          onOpenDetails={handleOpenDetails}
        />
      </div>
    </Layout>
  );
}
