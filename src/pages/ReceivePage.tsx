import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, ExternalLink, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { Button } from '@/ui';
import { Card, CardContent } from '@/components/ui/card';
import { useUnifiedWallet } from '@/features/wallet/hooks/core/useUnifiedWallet';
import { useUserProfile } from '@/features/profile/hooks/useUserProfile';
import { useClipboard } from '@/hooks/useClipboard';

const ReceivePage = () => {
  const { t } = useTranslation('wallet');
  const navigate = useNavigate();
  const { address, isConnected } = useUnifiedWallet();
  const { profile } = useUserProfile();
  const { copied, copyToClipboard } = useClipboard();

  const ensSubdomain = profile?.ens_subdomain 
    ? `${profile.ens_subdomain}.pryzen.eth` 
    : null;

  const displayAddress = address || '';

  const handleCopy = () => {
    if (displayAddress) {
      copyToClipboard(displayAddress, t('clipboard.addressCopiedDesc'));
    }
  };

  const handleViewOnExplorer = () => {
    if (displayAddress) {
      window.open(`https://basescan.org/address/${displayAddress}`, '_blank');
    }
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/wallet', { replace: true })}
            className="h-9 w-9 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t('receive')}</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {!isConnected ? (
          <Card className="bg-muted/20">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">{t('balance.connect')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ENS Display */}
            {ensSubdomain && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground mb-1">{t('ens.domain')}</p>
                <p className="text-xl font-bold text-primary">{ensSubdomain}</p>
              </motion.div>
            )}

            {/* QR Code Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-border/50">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
                
                <CardContent className="relative p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <h3 className="text-lg font-semibold text-center">{t('qr.title')}</h3>
                    
                    {/* QR Code */}
                    <motion.div 
                      className="relative p-1"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl animate-pulse opacity-50" />
                      
                      <div className="relative bg-card p-5 rounded-xl shadow-lg border border-border/30">
                        <QRCode
                          value={displayAddress}
                          size={180}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox="0 0 256 256"
                          level="M"
                        />
                      </div>
                    </motion.div>

                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                      {t('scanQR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Address Display */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-muted/20">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground text-center">{t('ens.fullAddress')}</p>
                  <div className="bg-muted/50 rounded-lg p-3 break-all text-xs font-mono text-center">
                    {displayAddress}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3"
            >
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    {t('clipboard.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    {t('qr.copyAddress')}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={handleViewOnExplorer}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('qr.explorer')}
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceivePage;
