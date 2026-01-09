
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CryptoSelector } from '@/components/shared/CryptoSelector';
import { CopyAddressCard } from '@/components/shared/CopyAddressCard';
import { DepositQRCode } from './DepositQRCode';
import { DepositInstructions } from './DepositInstructions';
import { useDeposit } from '../hooks/useDeposit';
import { Card, CardContent } from '@/components/ui/card';

const DepositPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('deposit');
  const { selectedCrypto, cryptoOptions, handleCryptoChange } = useDeposit();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:bg-muted/50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t('methods.crypto.title')}</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pb-6 space-y-6">
        {/* Crypto Selector */}
        <div className="space-y-3 pt-6">
          <h2 className="text-lg font-semibold">{t('methods.title')}</h2>
          <CryptoSelector
            selectedCrypto={selectedCrypto}
            onSelect={handleCryptoChange}
          />
        </div>

        {/* QR Code */}
        <DepositQRCode 
          address={selectedCrypto.address}
          cryptoSymbol={selectedCrypto.symbol}
        />

        {/* Deposit Address */}
        <CopyAddressCard
          address={selectedCrypto.address}
          cryptoSymbol={selectedCrypto.symbol}
        />

        {/* Instructions */}
        <DepositInstructions 
          cryptoName={selectedCrypto.name}
          cryptoSymbol={selectedCrypto.symbol}
        />

        {/* Processing Info */}
        <Card className="bg-gradient-to-br from-muted/20 to-muted/10 border-border/50">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold mb-4">{t('processing.title')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">{t('processing.network')}:</span>
                <span className="font-medium text-foreground">{selectedCrypto.network}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">{t('processing.confirmations')}:</span>
                <span className="font-medium text-foreground">{t('processing.blocks')}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">{t('processing.estimatedTime')}:</span>
                <span className="font-medium text-green-600">{t('processing.time')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                {t('security.title')}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('security.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositPage;
