import React, { useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { usePolymarketEventById, PolymarketEventWithPrices } from '@/features/polymarket';
import { PolymarketEventMobile } from '@/features/polymarket/components/mobile/PolymarketEventMobile';
import { Skeleton } from '@/components/ui/skeleton';
import { useTradingContext } from '@/features/polymarket/providers/TradingProvider';
import { PolymarketSEOHead } from '@/components/seo/PolymarketSEOHead';
import { extractEventIdFromPath } from '@/features/polymarket/utils/seoUrls';

interface EventContentProps {
  event: PolymarketEventWithPrices;
  onOpenDetails: (marketId: string) => void;
}

const EventContent: React.FC<EventContentProps> = ({ event, onOpenDetails }) => {
  const { openBuyModal } = useTradingContext();

  const handleView = useCallback((params: { 
    marketId: string; 
    side: 'YES' | 'NO'; 
    eventTitle: string;
    marketQuestion: string;
    tokenId?: string;
    price?: number;
    negRisk?: boolean;
    buyPrice?: number;
  }) => {
    const market = event.markets.find(m => m.id === params.marketId);
    const tokenId = params.tokenId || market?.clobTokenIds[params.side === 'YES' ? 0 : 1] || '';
    const buyPrice = params.buyPrice || params.price || 0.5;
    
    openBuyModal({
      marketId: params.marketId,
      eventId: String(event.id),
      tokenId,
      side: 'BUY',
      outcome: params.side,
      currentPrice: buyPrice,
      buyPrice,
      negRisk: params.negRisk ?? (market as any)?.negRisk ?? false,
      marketTitle: params.marketQuestion,
      eventTitle: params.eventTitle,
      eventImage: event.icon || event.image,
      // Données supplémentaires pour l'UI enrichie
      volume: (market as any)?.volumeNum ?? event.volume,
      liquidity: (market as any)?.liquidityNum ?? event.liquidity,
      endDate: event.endDate,
    });
  }, [openBuyModal, event.id, event.markets, event.volume, event.liquidity, event.endDate]);

  return (
    <>
      <PolymarketSEOHead 
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          icon: event.icon,
          image: event.image,
          endDate: event.endDate,
          volume: event.volume,
          markets: event.markets?.map(m => ({ id: m.id, question: m.question })),
        }}
      />
      <PolymarketEventMobile 
        event={event}
        onView={handleView}
        onOpenDetails={onOpenDetails}
      />
    </>
  );
};

const PolymarketEventDetail: React.FC = () => {
  const { eventId: paramEventId } = useParams<{ slug: string; eventId: string }>();
  const location = useLocation();
  // Extract eventId from path (last segment) to support both old and new URL formats
  const eventId = paramEventId || extractEventIdFromPath(location.pathname);
  const { data: polymarketEvent, isLoading: polymarketLoading, error: polymarketError } = usePolymarketEventById(eventId);

  const handleOpenDetails = useCallback((marketId: string) => {
    // TODO: Implement details logic
  }, []);

  if (polymarketLoading) {
    return (
      <Layout hideNavigation>
        <div className="min-h-screen bg-background p-4 space-y-4 animate-in fade-in duration-300">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-3 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-md" />
                  <Skeleton className="h-10 flex-1 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (polymarketError || !polymarketEvent) {
    return (
      <Layout>
        <div className="text-center py-8 text-muted-foreground">
          <p>Event not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavigation>
      <EventContent event={polymarketEvent} onOpenDetails={handleOpenDetails} />
    </Layout>
  );
};

export default PolymarketEventDetail;