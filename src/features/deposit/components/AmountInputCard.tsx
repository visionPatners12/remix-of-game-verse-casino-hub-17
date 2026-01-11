import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WalletToken } from '@/features/wallet/types';
import { useTranslation } from 'react-i18next';

interface AmountInputCardProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  selectedToken: WalletToken | null;
  error?: string;
}

export const AmountInputCard: React.FC<AmountInputCardProps> = ({
  amount,
  onAmountChange,
  selectedToken,
  error
}) => {
  const { t } = useTranslation('withdraw');

  const handleMax = () => {
    if (selectedToken) {
      onAmountChange(selectedToken.balance);
    }
  };

  const usdValue = selectedToken && amount 
    ? (parseFloat(amount) * (selectedToken.quote / parseFloat(selectedToken.balance))).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">
        {t('amount', 'Amount')}
      </label>
      
      <div className="relative">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className={cn(
            "h-14 text-2xl font-semibold pr-24 bg-muted/30",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMax}
            className="h-8 px-2 text-xs font-medium text-primary hover:text-primary/80"
          >
            {t('max', 'MAX')}
          </Button>
          <span className="text-muted-foreground font-medium">
            {selectedToken?.symbol || '---'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          ≈ ${usdValue} USD
        </span>
        
        {selectedToken && (
          <span className="text-muted-foreground">
            {t('availableBalance', 'Available')}: {parseFloat(selectedToken.balance).toFixed(4)} {selectedToken.symbol}
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default AmountInputCard;
