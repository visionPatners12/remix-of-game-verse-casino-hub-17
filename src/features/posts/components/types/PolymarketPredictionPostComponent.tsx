import React from 'react';
import { Link } from 'react-router-dom';
import { BasePost } from '@/features/social-feed/components/posts/base/BasePost';
import { TrendingUp, Lock, ChevronRight, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildPolymarketEventUrl } from '@/features/polymarket/utils/seoUrls';
import { useTradingContext } from '@/features/polymarket/providers/TradingProvider';
import { Button } from '@/components/ui/button';
import type { PolymarketPredictionPost, PostComponentProps } from '@/types/posts';

type PolymarketPostProps = PostComponentProps & {
  post: PolymarketPredictionPost;
};

/**
 * Polymarket prediction post component for the feed
 */
export function PolymarketPredictionPostComponent(props: PolymarketPostProps) {
  const { post } = props;
  const prediction = post.polymarketPrediction || post.polymarketPredictionContent;
  const { openBuyModal } = useTradingContext();

  const handleBuy = () => {
    if (!prediction?.clob_token_id) return;
    
    openBuyModal({
      marketId: prediction.market_id,
      eventId: prediction.event_id || prediction.market_id,
      tokenId: prediction.clob_token_id,
      outcome: (prediction.outcome === 'YES' || prediction.outcome === 'NO') ? prediction.outcome : 'YES',
      buyPrice: prediction.probability ? prediction.probability : 0.5,
      currentPrice: prediction.probability ? prediction.probability : 0.5,
      eventTitle: prediction.event_title,
      marketTitle: prediction.market_question || prediction.event_title,
      eventImage: prediction.event_image,
      side: 'BUY',
      negRisk: false,
    });
  };

  if (!prediction) {
    return (
      <BasePost {...(props as any)}>
        <div className="text-sm text-foreground">{post.content}</div>
      </BasePost>
    );
  }

  const {
    event_title,
    event_image,
    market_id,
    event_id,
    market_question,
    outcome,
    odds,
    probability,
    analysis,
    confidence,
    is_premium,
    status = 'pending',
  } = prediction;

  const confidenceLabels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
  const confidenceColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ];

  const statusConfig = {
    pending: { label: 'Pending', className: 'bg-blue-500/10 text-blue-500' },
    won: { label: 'Won', className: 'bg-green-500/10 text-green-500' },
    lost: { label: 'Lost', className: 'bg-red-500/10 text-red-500' },
  };

  const currentStatus = statusConfig[status];

  return (
    <BasePost {...(props as any)}>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 relative rounded-xl',
          is_premium && 'bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5'
        )}
      >
        {/* Premium indicator */}
        {is_premium && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
        )}

        {/* Event Header */}
        <div className="flex items-start gap-3 p-4 border-b border-border/50">
          {event_image ? (
            <img
              src={event_image}
              alt={event_title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                {event_title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {is_premium && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-medium">
                    <Lock className="h-3 w-3" />
                    Premium
                  </span>
                )}
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', currentStatus.className)}>
                  {currentStatus.label}
                </span>
              </div>
            </div>
            {market_question && market_question !== event_title && (
              <p className="text-xs text-muted-foreground mt-1">
                {market_question}
              </p>
            )}
          </div>
        </div>

        {/* Prediction Content */}
        <div className="p-4 space-y-4">
          {/* Outcome and Odds */}
          <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
            <div>
              <p className="text-xs text-muted-foreground">Prediction</p>
              <p className="text-lg font-bold text-foreground">{outcome}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Odds</p>
              <p className="text-lg font-bold text-primary">{odds.toFixed(2)}</p>
            </div>
          </div>

          {/* Probability */}
          {probability && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Implied probability</span>
              <span className="font-medium">{(probability * 100).toFixed(1)}%</span>
            </div>
          )}

          {/* Confidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Confidence
              </span>
              <span className="text-xs font-medium text-foreground">
                {confidenceLabels[confidence - 1]}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-colors',
                    level <= confidence ? confidenceColors[confidence - 1] : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Analysis */}
          {analysis && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed">{analysis}</p>
            </div>
          )}

          {/* Event Link */}
          {(event_id || market_id) && (
            <div className="pt-2">
              <Link
                to={buildPolymarketEventUrl({ id: event_id || market_id, title: event_title })}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <span>View event details</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Buy Button */}
          {prediction.clob_token_id && (
            <Button
              onClick={handleBuy}
              variant="default"
              size="sm"
              className="w-full mt-3"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy {outcome}
            </Button>
          )}
        </div>
      </div>
    </BasePost>
  );
}

PolymarketPredictionPostComponent.displayName = 'PolymarketPredictionPostComponent';
