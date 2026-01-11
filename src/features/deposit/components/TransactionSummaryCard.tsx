import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WalletToken } from '@/features/wallet/types';
import { SearchedUser } from '../hooks/useUserWalletLookup';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface TransactionSummaryCardProps {
  amount: string;
  selectedToken: WalletToken;
  destinationAddress: string;
  selectedUser?: SearchedUser | null;
  network: string;
  estimatedFee?: string;
  txHash?: string;
}

export const TransactionSummaryCard: React.FC<TransactionSummaryCardProps> = ({
  amount,
  selectedToken,
  destinationAddress,
  selectedUser,
  network,
  estimatedFee = '~$0.01',
  txHash
}) => {
  const { t } = useTranslation('withdraw');

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  const handleCopyHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      toast.success(t('summary.hashCopied', 'Transaction hash copied'));
    }
  };

  const usdValue = amount && selectedToken
    ? (parseFloat(amount) * (selectedToken.quote / parseFloat(selectedToken.balance))).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-4">
      {/* Transaction Details */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Amount row */}
          <div className="flex justify-between items-center p-4 border-b border-border">
            <span className="text-muted-foreground">{t('summary.amount', 'Amount')}</span>
            <div className="text-right">
              <span className="font-semibold text-lg">{amount} {selectedToken.symbol}</span>
              <p className="text-sm text-muted-foreground">≈ ${usdValue}</p>
            </div>
          </div>

          {/* Recipient row */}
          <div className="flex justify-between items-start p-4 border-b border-border">
            <span className="text-muted-foreground">{t('summary.to', 'To')}</span>
            <div className="text-right max-w-[60%]">
              {selectedUser ? (
                <>
                  <span className="font-medium block truncate">
                    {selectedUser.first_name || selectedUser.username || 'User'}
                  </span>
                  {selectedUser.ens_subdomain && (
                    <span className="text-primary text-sm block truncate">
                      {selectedUser.ens_subdomain}
                    </span>
                  )}
                </>
              ) : null}
              <span className="font-mono text-sm text-muted-foreground block truncate">
                {formatAddress(destinationAddress)}
              </span>
            </div>
          </div>

          {/* Network row */}
          <div className="flex justify-between items-center p-4 border-b border-border">
            <span className="text-muted-foreground">{t('summary.network', 'Network')}</span>
            <span className="font-medium">{network}</span>
          </div>

          {/* Fee row */}
          <div className="flex justify-between items-center p-4">
            <span className="text-muted-foreground">{t('summary.fee', 'Estimated Fee')}</span>
            <span className="font-medium">{estimatedFee}</span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Hash (if available) */}
      {txHash && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-700 dark:text-green-400">
                {t('summary.txSent', 'Transaction Sent')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background/50 px-2 py-1 rounded truncate">
                {txHash}
              </code>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyHash}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning */}
      {!txHash && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                {t('summary.warningTitle', 'Double-check everything')}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-500">
                {t('summary.warningText', 'This transaction cannot be reversed. Make sure the address is correct.')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionSummaryCard;
