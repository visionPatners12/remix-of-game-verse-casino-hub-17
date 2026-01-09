import { usePrecalculatedCashouts, useCashout, type Bet } from '@azuro-org/sdk';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletDeepLink } from '@/hooks/useWalletDeepLink';

interface CashoutButtonProps {
  bet: Pick<Bet, 'tokenId' | 'amount' | 'outcomes' | 'status' | 'totalOdds' | 'freebetId'>;
  isMobile?: boolean;
}

export function CashoutButton({ bet, isMobile }: CashoutButtonProps) {
  const { t } = useTranslation('bets');
  const { openWallet, isIosPwa } = useWalletDeepLink();
  
  // Get precalculated cashout amount
  const { data: precalculated, isFetching: isPrecalcFetching } = usePrecalculatedCashouts({ bet });
  
  // Hook to execute the cashout
  const { 
    submit, 
    approveTx,
    cashoutTx,
    isCashoutAvailable,
    isApproveRequired
  } = useCashout({
    bet,
    EIP712Attention: 'I understand that I am cashing out my bet early.',
    onSuccess: () => {
      toast.success(t('cashout.success'));
    },
    onError: (err) => {
      console.error('Cashout error:', err);
      toast.error(t('cashout.error'));
    }
  });

  const { cashoutAmount, isAvailable } = precalculated || {};
  
  const isProcessing = approveTx.isPending || approveTx.isProcessing || 
                       cashoutTx.isPending || cashoutTx.isProcessing;

  // Don't show button if cashout not available
  if (!isCashoutAvailable || !isAvailable || !cashoutAmount) {
    return null;
  }

  const handleCashout = async () => {
    try {
      await submit();
    } catch (error) {
      console.error('Cashout submit error:', error);
    }
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
      <Button 
        variant="ghost" 
        size={isMobile ? "default" : "sm"}
        className={`${isMobile ? 'text-sm h-12' : 'text-sm h-10'} ${isMobile ? 'w-full' : ''} text-muted-foreground hover:text-foreground rounded-full bg-card/30 backdrop-blur-sm border border-border/30 hover:bg-card/60 transition-all duration-300`}
        onClick={handleCashout}
        disabled={isProcessing || isPrecalcFetching}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {isApproveRequired ? t('cashout.approving') : t('cashout.processing')}
          </>
        ) : (
          `${t('actions.cashout')} ${cashoutAmount.toFixed(2)} USDT`
        )}
      </Button>
      
      {/* iOS PWA: Show "Open Wallet" button during transaction */}
      {isProcessing && isIosPwa && (
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          className={`${isMobile ? 'h-12' : 'h-10'} rounded-full`}
          onClick={openWallet}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('actions.openWallet', 'Open Wallet')}
        </Button>
      )}
    </div>
  );
}
