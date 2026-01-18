import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import type { OfframpQuoteResponse } from '../hooks/useCdpOfframpQuote';

interface OfframpQuoteBreakdownProps {
  quote: OfframpQuoteResponse | null;
  isLoading?: boolean;
}

export const OfframpQuoteBreakdown: React.FC<OfframpQuoteBreakdownProps> = ({ 
  quote, 
  isLoading 
}) => {
  const { t } = useTranslation('withdraw');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm">{t('cashout.loadingQuote', 'Getting quote...')}</span>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const formatAmount = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    if (currency === 'USD') {
      return `$${num.toFixed(2)}`;
    }
    return `${num.toFixed(2)} ${currency}`;
  };

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      {/* You sell */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {t('cashout.youSell', 'You sell')}
        </span>
        <span className="font-medium">
          {formatAmount(quote.sell_amount.value, quote.sell_amount.currency)}
        </span>
      </div>

      {/* Subtotal (fiat equivalent) */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {t('cashout.subtotal', 'Subtotal')}
        </span>
        <span className="text-muted-foreground">
          {formatAmount(quote.cashout_subtotal.value, quote.cashout_subtotal.currency)}
        </span>
      </div>

      {/* Coinbase fee */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {t('cashout.coinbaseFee', 'Coinbase fee')}
        </span>
        <span className="text-destructive">
          -{formatAmount(quote.coinbase_fee.value, quote.coinbase_fee.currency)}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-2" />

      {/* You receive */}
      <div className="flex justify-between items-center">
        <span className="font-medium">
          {t('cashout.youReceive', 'You receive')}
        </span>
        <span className="text-lg font-bold text-green-500">
          {formatAmount(quote.cashout_total.value, quote.cashout_total.currency)}
        </span>
      </div>
    </div>
  );
};
