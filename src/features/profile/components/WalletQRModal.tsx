import React from 'react';
import { useTranslation } from 'react-i18next';
import { UnifiedModal } from '@/components/unified';
import { DepositQRCode } from '@/features/deposit/components/DepositQRCode';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';

interface WalletQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  ensSubdomain?: string | null;
}

export const WalletQRModal = ({ isOpen, onClose, address, ensSubdomain }: WalletQRModalProps) => {
  const { t } = useTranslation('wallet');
  const { copyToClipboard } = useClipboard();

  const handleCopy = () => {
    copyToClipboard(address, t('clipboard.addressCopiedDesc'));
  };

  const handleViewOnExplorer = () => {
    window.open(`https://basescan.org/address/${address}`, '_blank');
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('qr.title')}
      size="md"
    >
      <div className="space-y-4">
        {/* ENS Display */}
        {ensSubdomain && (
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">{t('ens.domain')}</div>
            <div className="text-lg font-semibold text-primary">
              {ensSubdomain}
            </div>
          </div>
        )}

        {/* QR Code */}
        <DepositQRCode address={address} cryptoSymbol="ETH/USDT" />

        {/* Full Address Display */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground text-center">{t('ens.fullAddress')}</div>
          <div className="bg-muted/50 rounded-lg p-3 break-all text-xs font-mono text-center">
            {address}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-2" />
            {t('qr.copyAddress')}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleViewOnExplorer}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('qr.explorer')}
          </Button>
        </div>
      </div>
    </UnifiedModal>
  );
};
