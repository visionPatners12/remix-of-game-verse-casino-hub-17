import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import type { OnrampQuote } from '@/features/deposit/hooks/useCdpOnrampSession';

interface QuoteBreakdownProps {
  quote: OnrampQuote | null;
  isLoading?: boolean;
}

export const QuoteBreakdown: React.FC<QuoteBreakdownProps> = ({ quote, isLoading }) => {
  const { t } = useTranslation('deposit');

  if (isLoading) {
    return (
      <div className="bg-muted/50 rounded-xl p-4 border border-border/30">
        <div className="flex items-center justify-center gap-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t('coinbase.calculatingFees', 'Calculating fees...')}
          </span>
        </div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  // Extract fees by type
  const exchangeFee = quote.fees.find(f => f.type === 'FEE_TYPE_EXCHANGE');
  const networkFee = quote.fees.find(f => f.type === 'FEE_TYPE_NETWORK');

  return (
    <div className="bg-muted/50 rounded-xl p-4 border border-border/30 space-y-3">
      <h4 className="text-sm font-medium text-foreground">
        {t('coinbase.feeBreakdown', 'Fee Breakdown')}
      </h4>
      
      <div className="space-y-2">
        {/* Payment subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t('coinbase.subtotal', 'Subtotal')}
          </span>
          <span className="text-foreground">
            ${parseFloat(quote.paymentSubtotal).toFixed(2)} {quote.paymentCurrency}
          </span>
        </div>

        {/* Exchange fee */}
        {exchangeFee && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('coinbase.exchangeFee', 'Exchange Fee')}
            </span>
            <span className="text-foreground">
              ${parseFloat(exchangeFee.amount).toFixed(2)} {exchangeFee.currency}
            </span>
          </div>
        )}

        {/* Network fee */}
        {networkFee && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('coinbase.networkFee', 'Network Fee')}
            </span>
            <span className="text-foreground">
              ${parseFloat(networkFee.amount).toFixed(2)} {networkFee.currency}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border/50 my-2" />

        {/* Total */}
        <div className="flex justify-between text-sm font-medium">
          <span className="text-foreground">
            {t('coinbase.total', 'Total')}
          </span>
          <span className="text-foreground">
            ${parseFloat(quote.paymentTotal).toFixed(2)} {quote.paymentCurrency}
          </span>
        </div>

        {/* You receive */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t('coinbase.youReceive', 'You receive')}
          </span>
          <span className="text-primary font-medium">
            {parseFloat(quote.purchaseAmount).toFixed(2)} {quote.purchaseCurrency}
          </span>
        </div>

        {/* Exchange rate */}
        {quote.exchangeRate && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {t('coinbase.exchangeRate', 'Exchange Rate')}
            </span>
            <span className="text-muted-foreground">
              1 {quote.purchaseCurrency} = ${parseFloat(quote.exchangeRate).toFixed(4)} {quote.paymentCurrency}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
