import React from 'react';
import { NormalizedMarket, EventDetailCallbacks } from '@/types/oddsFormat';
import { formatVolume } from '@/utils/oddsCalculators';
import { OddsPill } from './OddsPill';

interface MarketDetailCardProps {
  market: NormalizedMarket;
  callbacks?: EventDetailCallbacks;
}

export const MarketDetailCard: React.FC<MarketDetailCardProps> = ({ market, callbacks }) => {
  const [forPrice, againstPrice] = market.prices;
  const [forProb, againstProb] = market.probabilities;

  return (
    <div className="rounded-xl border p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
      {/* En-tête de carte */}
      <div>
        <h3 className="text-sm sm:text-base md:text-lg font-medium leading-relaxed">
          {market.question}
        </h3>
      </div>

      {/* Sous-en-tête métriques */}
      <div className="text-xs sm:text-sm flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1">
        <span>Vol. {formatVolume(market.volume)}</span>
        <span>•</span>
        <span>Liq. {formatVolume(market.liquidity)}</span>
      </div>

      {/* Bloc Cotes */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <OddsPill
          side="FOR"
          label="YES"
          price={forPrice}
          format="decimal"
          disabled={!market.isActive}
          onSelect={callbacks?.onSelect}
          marketId={market.id}
        />
        <OddsPill
          side="AGAINST"
          label="NO"
          price={againstPrice}
          format="decimal"
          disabled={!market.isActive}
          onSelect={callbacks?.onSelect}
          marketId={market.id}
        />
      </div>

      {/* Ligne d'info fine */}
      <div className="text-[10px] sm:text-[11px] md:text-xs text-center opacity-75">
        Prob. Yes: {forProb.toFixed(1)}% • Prob. No: {againstProb.toFixed(1)}%
      </div>

      {/* Footer optionnel */}
      {market.rulesUrl && (
        <div className="pt-2 border-t">
          <a 
            href={market.rulesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] sm:text-xs underline hover:no-underline"
          >
            Règles
          </a>
        </div>
      )}
    </div>
  );
};