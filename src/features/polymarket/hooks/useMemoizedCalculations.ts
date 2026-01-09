import { useMemo } from 'react';
import { PolymarketEvent } from '../types/events';
import { determineTemplate, getPrimaryMarket, getYesPercentage } from '../utils/helpers';

// Custom hook to memoize expensive Polymarket calculations
export const useMemoizedCalculations = (event: PolymarketEvent) => {
  return useMemo(() => {
    const template = determineTemplate(event);
    const primaryMarket = getPrimaryMarket(event);
    const yesPercentage = getYesPercentage(primaryMarket);
    const volume = event.volume || 0;
    
    return {
      template,
      primaryMarket,
      yesPercentage,
      volume,
      image: event.icon || event.image
    };
  }, [event]);
};

// Static reaction data to avoid Math.random() calls
export const useStaticReactionData = () => {
  return useMemo(() => ({
    likes: 28,
    comments: 14,
    shares: 7
  }), []);
};