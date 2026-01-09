import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, TrendingUp, Lock, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePolymarketPrediction, PredictionSelection } from '@/features/polymarket/hooks/usePolymarketPrediction';
import { useGetStream } from '@/contexts/StreamProvider';
import type { PolymarketEvent, PolymarketMarket } from '@/features/polymarket/types/events';

interface LocationState {
  event: PolymarketEvent;
  market: PolymarketMarket;
  outcome: string;
  odds: number;
  probability: number;
}

const SESSION_STORAGE_KEY = 'polymarket_prediction_state';

export default function CreatePolymarketPrediction() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('polymarket');
  const { isReady: isStreamReady, isLoading: isStreamLoading, error: streamError } = useGetStream();

  // Try location.state first, then sessionStorage fallback
  const state = useMemo<LocationState | undefined>(() => {
    if (location.state) return location.state as LocationState;
    
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) return JSON.parse(stored) as LocationState;
    } catch (e) {
      console.error('[CreatePolymarketPrediction] Failed to parse sessionStorage:', e);
    }
    return undefined;
  }, [location.state]);

  const {
    analysis,
    confidence,
    isPremium,
    isSubmitting,
    isReady,
    setAnalysis,
    setConfidence,
    setIsPremium,
    submitPrediction,
  } = usePolymarketPrediction();


  // Show loading while GetStream initializes
  if (isStreamLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{t('createPrediction.initializing')}</p>
        </div>
      </div>
    );
  }

  // Show error with retry if GetStream failed
  if (streamError && !isStreamReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-md">
          <p className="text-destructive mb-4">{t('createPrediction.connectionError')}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('createPrediction.retry')}
          </Button>
        </Card>
      </div>
    );
  }

  // Redirect if no state
  if (!state?.event || !state?.market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-md">
          <p className="text-muted-foreground mb-4">
            {t('createPrediction.noMarketSelected')}
          </p>
          <Button onClick={() => navigate(-1)}>{t('createPrediction.return')}</Button>
        </Card>
      </div>
    );
  }

  const { event, market, outcome, odds, probability } = state;

  const handleSubmit = async () => {
    const selection: PredictionSelection = {
      market,
      outcome,
      odds,
      probability,
    };
    const success = await submitPrediction(event, selection);
    if (success) {
      // Clear sessionStorage on success
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  const confidenceLabels = t('createPrediction.confidenceLabels', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{t('createPrediction.title')}</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-32">
        {/* Event Card */}
        <div className="rounded-xl bg-card/50 overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            {event.icon ? (
              <img
                src={event.icon}
                alt={event.title}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground line-clamp-2">
                {event.title}
              </h2>
              {market.question && market.question !== event.title && (
                <p className="text-sm text-muted-foreground mt-1">
                  {market.question}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="rounded-xl bg-card/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('createPrediction.yourPrediction')}</p>
              <p className="text-lg font-bold text-foreground">{outcome}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t('createPrediction.odds')}</p>
              <p className="text-lg font-bold text-primary">{odds.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('createPrediction.impliedProbability')}</span>
              <span className="font-medium">{(probability * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="space-y-2">
          <Label htmlFor="analysis">{t('createPrediction.analysis')}</Label>
          <Textarea
            id="analysis"
            placeholder={t('createPrediction.analysisPlaceholder')}
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        {/* Confidence */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t('createPrediction.confidenceLevel')}</Label>
            <span className="text-sm font-medium text-primary">
              {confidenceLabels[confidence - 1]}
            </span>
          </div>
          <Slider
            value={[confidence]}
            onValueChange={([v]) => setConfidence(v)}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        {/* Premium Toggle */}
        <div className="rounded-xl bg-card/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t('createPrediction.premiumTip')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('createPrediction.premiumDescription')}
                </p>
              </div>
            </div>
            <Switch
              checked={isPremium}
              onCheckedChange={setIsPremium}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isReady}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('createPrediction.publishing')}
            </>
          ) : !isReady ? (
            t('createPrediction.loading')
          ) : (
            t('createPrediction.publish')
          )}
        </Button>
      </div>
    </div>
  );
}
