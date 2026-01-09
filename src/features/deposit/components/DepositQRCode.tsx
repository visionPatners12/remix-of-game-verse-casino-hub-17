import React from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface DepositQRCodeProps {
  address: string;
  cryptoSymbol: string;
}

export const DepositQRCode = ({ address, cryptoSymbol }: DepositQRCodeProps) => {
  const { t } = useTranslation('deposit');

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-border/50">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      
      <CardContent className="relative p-6">
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold text-center">{t('crypto.qrTitle')}</h3>
          
          {/* QR Code with animated border */}
          <motion.div 
            className="relative p-1"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated pulsing border */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl animate-pulse opacity-50" />
            
            <div className="relative bg-white p-5 rounded-xl shadow-lg">
              <QRCode
                value={address}
                size={180}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
                level="M"
              />
            </div>
          </motion.div>

          
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {t('crypto.qrDescription', { symbol: cryptoSymbol })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
