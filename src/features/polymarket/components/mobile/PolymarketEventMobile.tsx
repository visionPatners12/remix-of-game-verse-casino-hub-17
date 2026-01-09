import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, TrendingUp, Droplets, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EnrichedPolymarketEvent, PolymarketMarket } from '@/features/polymarket/types/events';
import { ReactionSection } from '@/features/polymarket/components/ui/ReactionSection';
import { formatVolume } from '@/features/polymarket/utils/formatters';
import { parseOutcomes, parseOutcomePrices, getMarketLabel } from '@/features/polymarket/utils/helpers';
import { getTokenIdsFromMarket, getMarketPrices } from '@/features/polymarket/utils/tokenUtils';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import { useAuth } from '@/features/auth';

interface PolymarketEventMobileProps {
  event: EnrichedPolymarketEvent;
  onView?: (params: { 
    marketId: string; 
    side: 'YES' | 'NO'; 
    eventTitle: string;
    marketQuestion: string;
    tokenId: string;
    price: number;
    negRisk: boolean;
  }) => void;
  onOpenDetails: (marketId: string) => void;
}

// Helper component to display formatted odds
const FormattedOddsButton = memo(({ 
  odds, 
  label, 
  variant, 
  onClick 
}: { 
  odds: number; 
  label: string; 
  variant: 'yes' | 'no';
  onClick: () => void;
}) => {
  const { formattedOdds } = useOddsDisplay({ odds });
  const isYes = variant === 'yes';
  
  return (
    <button 
      className={`flex items-center justify-between ${
        isYes 
          ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30'
          : 'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30'
      } rounded px-3 py-2 text-sm font-medium flex-1 min-w-0 transition-colors`}
      onClick={onClick}
    >
      <span>{label}</span>
      {formattedOdds && (
        <span className="font-semibold ml-1">
          {formattedOdds}
        </span>
      )}
    </button>
  );
});

FormattedOddsButton.displayName = 'FormattedOddsButton';

export const PolymarketEventMobile: React.FC<PolymarketEventMobileProps> = memo(({
  event,
  onView,
  onOpenDetails
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('polymarket');
  const { isAuthenticated } = useAuth();
  const [isPredictionMode, setIsPredictionMode] = useState(false);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleBuyClick = useCallback((market: PolymarketMarket, side: 'YES' | 'NO') => {
    const tokenIds = getTokenIdsFromMarket(market);
    const prices = getMarketPrices(market);
    const price = side === 'YES' ? prices.yesPrice || 0.5 : prices.noPrice || 0.5;
    const tokenId = side === 'YES' ? tokenIds?.yes : tokenIds?.no;
    
    onView?.({ 
      marketId: market.id, 
      side,
      eventTitle: event.title,
      marketQuestion: market.question,
      tokenId: tokenId || '',
      price,
      negRisk: market.negRisk || false,
    });
  }, [onView, event.title]);

  const handleOpinionClick = useCallback(() => {
    toast({
      title: t('opinion.title'),
      description: t('opinion.comingSoon'),
      duration: 3000,
    });
  }, [toast, t]);

  const handlePredictionClick = useCallback((market: PolymarketMarket, outcome: 'Yes' | 'No', odds: number) => {
    console.log('[PolymarketEventMobile] handlePredictionClick', { isAuthenticated, marketId: market.id, outcome, odds });
    
    if (!isAuthenticated) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginToPredict'),
        variant: "destructive",
      });
      return;
    }

    const probability = odds > 0 ? 1 / odds : 0;
    
    const predictionState = {
      event,
      market,
      outcome,
      odds,
      probability,
    };
    
    // Persist in sessionStorage to survive page refresh
    sessionStorage.setItem('polymarket_prediction_state', JSON.stringify(predictionState));
    
    navigate('/create-polymarket-prediction', { state: predictionState });
  }, [isAuthenticated, event, navigate, toast, t]);

  const togglePredictionMode = useCallback(() => {
    setIsPredictionMode(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Back Button */}
      <div className="px-2 py-2">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">{t('event.back')}</span>
        </button>
      </div>

      {/* Event Header - Style EventDetailHeader mais adapté */}
      <div className="px-2 py-2">
        <div className="flex items-start gap-3">
          {/* Event Icon */}
          {event.icon ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center">
              <img 
                src={event.icon} 
                alt={event.title}
                className="w-14 h-14 rounded-xl object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
            </div>
          )}

          {/* Event Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold leading-tight text-foreground">
              {event.title}
            </h1>
            
            {event.description && (
              <p className="text-sm leading-snug line-clamp-2 mt-1 text-muted-foreground">
                {event.description}
              </p>
            )}

            {/* Metrics */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <div className="inline-flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                <span>{formatVolume(event.volume || 0)}</span>
              </div>
              <div className="inline-flex items-center gap-1 text-muted-foreground">
                <Droplets className="w-3 h-3" />
                <span>{formatVolume(event.liquidity || 0)}</span>
              </div>
              <div className="inline-flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date(event.endDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {event.tags.slice(0, 5).map(tag => (
                  <span 
                    key={tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                  >
                    #{tag.label}
                  </span>
                ))}
                {event.tags.length > 5 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{event.tags.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prediction Mode Toggle */}
      <div className="px-4 py-2">
        <Button
          variant={isPredictionMode ? "default" : "outline"}
          size="sm"
          className={`w-full transition-all ${isPredictionMode ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={togglePredictionMode}
        >
          <Target className="w-4 h-4 mr-2" />
          {isPredictionMode ? t('prediction.cancel') : t('prediction.toggle')}
        </Button>
      </div>

      {/* Markets List */}
      <div className="px-2 py-2">
        <div className="space-y-2">
          {event.markets && event.markets.length > 0 ? event.markets
            .filter((market) => !market.closed && market.active)
            .map((market) => {
            const outcomes = parseOutcomes(market.outcomes);
            const prices = parseOutcomePrices(market.outcomePrices);
            const label = getMarketLabel(market);
            
            if (outcomes.length === 2 && outcomes.includes('Yes') && outcomes.includes('No')) {
              const yesPrice = prices[0] ? parseFloat(prices[0]) : 0;
              const noPrice = prices[1] ? parseFloat(prices[1]) : 0;
              
              const isValidYes = yesPrice > 0 && yesPrice < 1 && isFinite(yesPrice) && !isNaN(yesPrice);
              const isValidNo = noPrice > 0 && noPrice < 1 && isFinite(noPrice) && !isNaN(noPrice);
              
              const hasValidOdds = isValidYes || isValidNo;
              const yesOdds = isValidYes ? 1 / yesPrice : 0;
              const noOdds = isValidNo ? 1 / noPrice : 0;

              return (
                <div key={market.id} className="p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {label}
                      </h4>
                    </div>
                    
                    {hasValidOdds ? (
                      isPredictionMode ? (
                        // Prediction mode: show prediction buttons
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20"
                            onClick={() => handlePredictionClick(market, 'Yes', yesOdds)}
                          >
                            <Target className="w-3 h-3 mr-1" />
                            {t('prediction.predictYes')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20"
                            onClick={() => handlePredictionClick(market, 'No', noOdds)}
                          >
                            <Target className="w-3 h-3 mr-1" />
                            {t('prediction.predictNo')}
                          </Button>
                        </div>
                      ) : (
                        // Normal mode: show odds buttons
                        <div className="flex gap-2">
                          <FormattedOddsButton
                            odds={yesOdds}
                            label="YES"
                            variant="yes"
                            onClick={() => handleBuyClick(market, 'YES')}
                          />
                          <FormattedOddsButton
                            odds={noOdds}
                            label="NO"
                            variant="no"
                            onClick={() => handleBuyClick(market, 'NO')}
                          />
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center bg-muted/50 rounded px-3 py-2 text-sm text-muted-foreground">
                        {t('event.pause')}
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              // Multi-outcome market
              const hasAnyValidPrice = prices.some(p => {
                const price = parseFloat(p);
                return price > 0 && price < 1 && isFinite(price) && !isNaN(price);
              });

              return (
                <div key={market.id} className="p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {label}
                      </h4>
                    </div>
                    
                    {hasAnyValidPrice ? (
                      <div className="grid grid-cols-2 gap-2">
                        {outcomes.map((outcome, idx) => {
                          const price = prices[idx] ? parseFloat(prices[idx]) : 0;
                          const odds = price > 0 && price < 1 ? 1 / price : 0;
                          
                          return isPredictionMode ? (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                              onClick={() => handlePredictionClick(market, outcome as 'Yes' | 'No', odds)}
                            >
                              <Target className="w-3 h-3 mr-1" />
                              <span className="truncate">{outcome}</span>
                            </Button>
                          ) : (
                            <button
                              key={idx}
                              className="flex items-center justify-center bg-muted text-foreground hover:bg-muted/80 rounded px-3 py-2 text-xs font-medium transition-colors"
                              onClick={() => handleBuyClick(market, outcome as 'YES' | 'NO')}
                            >
                              <span className="truncate">{outcome}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center bg-muted/50 rounded px-3 py-2 text-sm text-muted-foreground">
                        {t('event.pause')}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          }) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('event.noMarkets')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Reaction Section at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <ReactionSection
          eventId={event.id}
          marketId={event.id}
          commentsCount={event.comments_count ?? 0}
        />
      </div>
    </div>
  );
});
