import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Smartphone, Building2, Sparkles, ChevronRight, CheckCircle2, Shield, Zap } from 'lucide-react';
import { StepProgressIndicator } from '@/components/shared/StepProgressIndicator';
import { CopyAddressCard } from '@/components/shared/CopyAddressCard';
import { DepositQRCode } from './DepositQRCode';
import { DepositInstructions } from './DepositInstructions';
import { useDeposit } from '../hooks/useDeposit';
import { useUnifiedWallet } from '@/features/wallet';
import { useFundWallet } from '@privy-io/react-auth';
import { useResponsive } from '@/hooks/useResponsive';
import { base } from 'viem/chains';
import { cn } from '@/lib/utils';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { motion, AnimatePresence } from 'framer-motion';

type DepositMethod = 'crypto' | 'coinbase' | 'mobile-money' | 'bank-transfer' | 'apple-pay';

interface DepositMethodOption {
  id: DepositMethod;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  available: boolean;
  gradient: string;
  iconBg: string;
  recommended?: boolean;
}

const DepositFlow = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('deposit');
  const { selectedCrypto, isLoadingAddress, ensSubdomain } = useDeposit();
  const { address } = useUnifiedWallet();
  const { fundWallet } = useFundWallet();
  const { isMobile, isDesktop } = useResponsive();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const stepLabels = [
    t('steps.method'),
    t('steps.details'),
    t('steps.confirmation')
  ];

  const depositMethods: DepositMethodOption[] = [
    {
      id: 'crypto',
      titleKey: 'methods.crypto.title',
      descriptionKey: 'methods.crypto.description',
      icon: <Sparkles className="h-5 w-5" />,
      available: true,
      gradient: 'from-violet-500/20 via-purple-500/10 to-fuchsia-500/20',
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
      recommended: true
    },
    {
      id: 'coinbase',
      titleKey: 'methods.coinbase.title',
      descriptionKey: 'methods.coinbase.description',
      icon: <CreditCard className="h-5 w-5" />,
      available: false,
      gradient: 'from-blue-500/20 via-blue-400/10 to-cyan-500/20',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      id: 'mobile-money',
      titleKey: 'methods.mobileMoney.title',
      descriptionKey: 'methods.mobileMoney.description',
      icon: <Smartphone className="h-5 w-5" />,
      available: false,
      gradient: 'from-emerald-500/20 via-green-400/10 to-teal-500/20',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600'
    },
    {
      id: 'bank-transfer',
      titleKey: 'methods.bankTransfer.title',
      descriptionKey: 'methods.bankTransfer.description',
      icon: <Building2 className="h-5 w-5" />,
      available: false,
      gradient: 'from-amber-500/20 via-orange-400/10 to-yellow-500/20',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      id: 'apple-pay',
      titleKey: 'methods.applePay.title',
      descriptionKey: 'methods.applePay.description',
      icon: <Zap className="h-5 w-5" />,
      available: true,
      gradient: 'from-slate-500/20 via-gray-400/10 to-zinc-500/20',
      iconBg: 'bg-gradient-to-br from-slate-700 to-slate-900'
    }
  ];

  const handleApplePayFund = async () => {
    if (!address) {
      console.error('No wallet address available');
      return;
    }
    
    setIsProcessing(true);
    try {
      await fundWallet(address, {
        chain: base,
        amount: '0.01'
      });
      setCurrentStep(3);
    } catch (error) {
      console.error('Apple Pay funding failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMethodSelect = (method: DepositMethod) => {
    if (method === 'coinbase') {
      navigate('/deposit/coinbase');
      return;
    }
    if (method === 'apple-pay') {
      handleApplePayFund();
      return;
    }
    setSelectedMethod(method);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className={cn(
                "font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text",
                isMobile ? "text-xl" : "text-2xl"
              )}>
                {t('methods.title')}
              </h2>
            </div>
            
            <div className={cn(
              "space-y-3",
              isDesktop && "max-w-lg mx-auto"
            )}>
              {depositMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card 
                    className={cn(
                      "relative overflow-hidden cursor-pointer transition-all duration-300 border-border/50",
                      "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:scale-[1.02]",
                      !method.available && "opacity-60 cursor-not-allowed hover:scale-100 hover:shadow-none",
                      isProcessing && method.id === 'apple-pay' && "animate-pulse"
                    )}
                    onClick={() => method.available && !isProcessing && handleMethodSelect(method.id)}
                  >
                    {/* Gradient background */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-50",
                      method.gradient
                    )} />
                    
                    <CardContent className="relative p-4">
                      <div className="flex items-center gap-4">
                        {/* Icon with gradient */}
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                          method.iconBg
                        )}>
                          {method.icon}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{t(method.titleKey)}</h3>
                            {method.recommended && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full">
                                {t('methods.recommended')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{t(method.descriptionKey)}</p>
                        </div>
                        
                        {/* Arrow or status */}
                        <div className="flex-shrink-0">
                          {!method.available ? (
                            <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md">
                              {t('methods.comingSoon')}
                            </span>
                          ) : isProcessing && method.id === 'apple-pay' ? (
                            <span className="text-xs text-primary font-medium">
                              {t('methods.processing')}
                            </span>
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        if (selectedMethod === 'crypto') {
          if (isLoadingAddress) {
            return (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <div className="relative mx-auto w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  </div>
                  <p className="mt-6 text-muted-foreground">{t('crypto.loading')}</p>
                </div>
              </motion.div>
            );
          }

          if (!selectedCrypto.address) {
            return (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t('crypto.error')}</p>
                  <Button onClick={() => window.location.reload()} className="mt-4">
                    {t('crypto.retry')}
                  </Button>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "space-y-6",
                isDesktop && "max-w-2xl mx-auto"
              )}
            >
              <div className="text-center space-y-2">
                <h2 className={cn(
                  "font-bold",
                  isMobile ? "text-xl" : "text-2xl"
                )}>{t('crypto.title')}</h2>
                <p className="text-muted-foreground text-sm">
                  {t('crypto.subtitle')}
                </p>
              </div>

              <div className={cn(
                isDesktop && "grid grid-cols-2 gap-6 items-start"
              )}>
                <div className="space-y-4">
                  <DepositQRCode 
                    address={selectedCrypto.address}
                    cryptoSymbol={selectedCrypto.symbol}
                  />

                  <CopyAddressCard
                    address={selectedCrypto.address}
                    cryptoSymbol={selectedCrypto.symbol}
                  />
                </div>

                <div className={cn(isMobile && "mt-6")}>
                  <DepositInstructions 
                    cryptoName={selectedCrypto.name}
                    cryptoSymbol={selectedCrypto.symbol}
                  />
                </div>
              </div>

              <div className={cn(
                "flex gap-3",
                isDesktop && "justify-center max-w-md mx-auto"
              )}>
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  {t('buttons.back')}
                </Button>
                <Button onClick={() => setCurrentStep(3)} className="flex-1">
                  {t('buttons.continue')}
                </Button>
              </div>
            </motion.div>
          );
        }

        if (selectedMethod === 'mobile-money') {
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "space-y-6",
                isDesktop && "max-w-md mx-auto"
              )}
            >
              <h2 className={cn(
                "font-bold text-center",
                isMobile ? "text-xl" : "text-2xl"
              )}>{t('mobileMoney.title')}</h2>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-200/50 dark:border-emerald-800/50">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t('mobileMoney.serviceTitle')}</h3>
                  <p className="text-muted-foreground mb-6">{t('mobileMoney.serviceDescription')}</p>
                  <Button variant="outline" onClick={handleBack}>
                    {t('mobileMoney.chooseAnother')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        }

        return null;

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "space-y-6",
              isDesktop && "max-w-md mx-auto"
            )}
          >
            <h2 className={cn(
              "font-bold text-center",
              isMobile ? "text-xl" : "text-2xl"
            )}>{t('confirmation.title')}</h2>
            
            {/* Success Card with glassmorphism */}
            <Card className="relative overflow-hidden border-green-200/50 dark:border-green-800/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/20">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-400/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl" />
              
              <CardContent className="relative p-6 text-center">
                {/* Animated checkmark */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30"
                >
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                  {selectedMethod === 'apple-pay' 
                    ? t('confirmation.applePayTitle')
                    : t('confirmation.cryptoTitle')}
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-6">
                  {selectedMethod === 'apple-pay' 
                    ? t('confirmation.applePayDesc')
                    : t('confirmation.cryptoDesc')}
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    {t('confirmation.viewWallet')}
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="w-full">
                    {t('confirmation.newDeposit')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {selectedMethod === 'crypto' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-4">{t('processing.title')}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">{t('processing.network')}:</span>
                        <span className="font-medium">Polygon</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">{t('processing.confirmations')}:</span>
                        <span className="font-medium">{t('processing.blocks')}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">{t('processing.estimatedTime')}:</span>
                        <span className="font-medium text-green-600">{t('processing.time')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MobilePageHeader title={t('page.title')} onBack={handleBack} />

      {/* Progress Indicator */}
      <div className={cn(
        isMobile ? "px-4" : "max-w-4xl mx-auto px-6"
      )}>
        <StepProgressIndicator 
          currentStep={currentStep}
          totalSteps={3}
          stepLabels={stepLabels}
        />
      </div>

      {/* Content */}
      <div className={cn(
        "pb-6",
        isMobile ? "px-4" : "max-w-4xl mx-auto px-6"
      )}>
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      {/* Security Notice */}
      {currentStep === 2 && selectedMethod === 'crypto' && !isLoadingAddress && selectedCrypto.address && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "pb-6",
            isMobile ? "px-4" : "max-w-4xl mx-auto px-6"
          )}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  {t('security.title')}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('security.description')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DepositFlow;
