import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, QrCode, Wallet } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { walletUtils } from '@/features/wallet/utils';
import { WalletQRModal } from './WalletQRModal';

interface WalletDisplayProps {
  address: string;
  ensSubdomain?: string | null;
}

export const WalletDisplay = ({ address, ensSubdomain }: WalletDisplayProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { copyToClipboard } = useClipboard();

  const fullEns = ensSubdomain ? `${ensSubdomain}.proprono.eth` : null;
  const truncatedAddress = walletUtils.truncateAddress(address);

  const handleCopy = () => {
    copyToClipboard(address, "Adresse copiée dans le presse-papiers");
  };

  return (
    <>
      <Card className="mb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              {fullEns && (
                <div className="text-sm font-semibold text-foreground mb-0.5">
                  {fullEns}
                </div>
              )}
              <div className="text-xs text-muted-foreground font-mono">
                {truncatedAddress}
              </div>
            </div>

            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4" />
                <span className="sr-only">Copier l'adresse</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsModalOpen(true)}
              >
                <QrCode className="w-4 h-4" />
                <span className="sr-only">Afficher le QR code</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <WalletQRModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        address={address}
        ensSubdomain={fullEns}
      />
    </>
  );
};
