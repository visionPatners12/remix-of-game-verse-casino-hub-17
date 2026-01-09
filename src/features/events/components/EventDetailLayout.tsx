import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventDetail, EventDetailCallbacks } from '@/types/oddsFormat';
import { EventDetailHeader } from './EventDetailHeader';
import { MarketDetailCard } from './MarketDetailCard';
import { Loader2, Search, ArrowLeft, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/ui';

interface EventDetailLayoutProps {
  event?: EventDetail;
  isLoading: boolean;
  error?: Error | null;
  notFound?: boolean;
  callbacks?: EventDetailCallbacks;
}

const MarketCardSkeleton = () => (
  <div className="rounded-xl border p-3 sm:p-4 min-h-[180px]">
    <div className="animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-muted rounded w-full mb-3"></div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="h-10 sm:h-12 bg-muted rounded-xl"></div>
        <div className="h-10 sm:h-12 bg-muted rounded-xl"></div>
      </div>
      <div className="h-3 bg-muted rounded w-2/3"></div>
    </div>
  </div>
);

export const EventDetailLayout: React.FC<EventDetailLayoutProps> = ({
  event,
  isLoading,
  error,
  notFound,
  callbacks
}) => {
  const navigate = useNavigate();

  const BackButton = () => (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 p-2 text-sm transition-transform duration-150 hover:translate-y-[1px] active:scale-[0.99]"
      aria-label="Back"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading event...</p>
          </div>
          
          {/* Skeleton placeholder */}
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-muted rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full mb-3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <MarketCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="p-4 rounded-full bg-muted">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-xl font-semibold">Event not found</h1>
              <p className="text-sm text-muted-foreground max-w-md">
                The event you're looking for doesn't exist or is no longer available.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="p-4 rounded-full bg-muted/50">
              <WifiOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-xl font-semibold">Network error</h1>
              <p className="text-sm text-muted-foreground max-w-md">
                Please check your connection and try again.
              </p>
            </div>
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!event) {
    return (
      <div className="min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="p-4 rounded-full bg-muted">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-xl font-semibold">No event</h1>
              <p className="text-sm text-muted-foreground">
                No data available for this event.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-4">
      <div className="max-w-6xl mx-auto">
        <BackButton />
        
        {/* Header */}
        <EventDetailHeader event={event} />

        {/* Markets Grid */}
        {event.markets && event.markets.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {event.markets.map((market) => (
              <MarketDetailCard
                key={market.id}
                market={market}
                callbacks={callbacks}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">No markets available</p>
              <p className="text-sm text-muted-foreground">
                This event doesn't have any active markets at the moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};