import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { motion } from 'framer-motion';

interface CopyAddressCardProps {
  address: string;
  cryptoSymbol: string;
}

export const CopyAddressCard = ({ 
  address, 
  cryptoSymbol
}: CopyAddressCardProps) => {
  const { t } = useTranslation('deposit');
  const { copied, copyToClipboard } = useClipboard();

  const handleCopy = () => {
    copyToClipboard(address, t('crypto.addressCopied'));
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      
      <CardContent className="relative p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1">
              {t('crypto.copyTitle', { symbol: cryptoSymbol })}
            </h4>
            <p className="text-xs text-muted-foreground">
              {t('crypto.copyDescription')}
            </p>
          </div>

          
          <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
            <p className="text-xs font-mono break-all text-foreground leading-relaxed">
              {address}
            </p>
          </div>
          
          <motion.div
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleCopy}
              className={`w-full h-11 font-medium transition-all duration-300 ${
                copied 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('crypto.copied')}
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  {t('crypto.copyAddress')}
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};
