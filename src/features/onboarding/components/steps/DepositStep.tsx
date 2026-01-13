import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, CheckCircle, AlertCircle, CreditCard, Sparkles, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingStepProps } from '../../types';
import { useENSGeneration } from '../../hooks/useENSGeneration';
import { useUserProfile } from '@/features/profile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DepositQRCode } from '@/features/deposit/components/DepositQRCode';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingLayout } from '../OnboardingLayout';
import { TokenUSDC, NetworkBase } from '@web3icons/react';

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-1.5">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <motion.div
        key={index}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          index < currentStep ? 'bg-primary w-8' : 'bg-muted w-6'
        }`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: index * 0.05 }}
      />
    ))}
  </div>
);

export const DepositStep = ({ onNext, onBack }: OnboardingStepProps) => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { autoGenerateENSAndDeposit, isLoading, generatedENS, depositAddress, generationError, resetENS } = useENSGeneration();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [existingENS, setExistingENS] = useState<string | null>(null);
  const [existingWallet, setExistingWallet] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingENS = async () => {
      if (profile?.id) {
        const { data } = await supabase
          .from('users')
          .select('ens_subdomain, wallet_address')
          .eq('id', profile.id)
          .single();
        
        if (data?.ens_subdomain) {
          setExistingENS(data.ens_subdomain);
          setExistingWallet(data.wallet_address);
        } else if (profile?.username) {
          autoGenerateENSAndDeposit(profile.username);
        }
      }
    };
    
    checkExistingENS();
  }, [profile?.username, profile?.id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({
      title: t('onboarding.steps.deposit.copied'),
      description: t('onboarding.steps.deposit.copiedDesc', { label }),
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSkip = () => {
    resetENS();
    onNext?.();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mx-auto relative">
              <Wallet className="w-10 h-10 text-primary-foreground animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{t('onboarding.steps.deposit.generating')}</h3>
          <p className="text-muted-foreground">
            {t('onboarding.steps.deposit.generatingSubtitle')}
          </p>
          <div className="mt-6">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </motion.div>
      );
    }

    if (generationError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{t('onboarding.steps.deposit.serviceUnavailable')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('onboarding.steps.deposit.serviceUnavailableSubtitle')}
          </p>
          <Button onClick={handleSkip} className="rounded-xl min-h-[44px]">
            {t('onboarding.steps.deposit.skipThisStep')}
          </Button>
        </motion.div>
      );
    }

    if (existingENS || (generatedENS && depositAddress)) {
      const ensName = existingENS || generatedENS;
      const address = existingWallet || depositAddress;
      
      return (
        <motion.div 
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* USDC on Base Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-2xl border border-primary/20"
          >
            <TokenUSDC variant="branded" size={32} />
            <span className="text-lg font-semibold text-foreground">USDC</span>
            <span className="text-muted-foreground">on</span>
            <NetworkBase variant="branded" size={32} />
            <span className="text-lg font-semibold text-foreground">Base</span>
          </motion.div>

          {/* QR Code Section */}
          {address && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <DepositQRCode address={address} cryptoSymbol="USDC" />
            </motion.div>
          )}

          {/* ENS Address Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-500 uppercase tracking-wide">
                    {t('onboarding.steps.deposit.newAddress')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('onboarding.steps.deposit.newAddressDesc')}
                </p>
                <div className="flex items-center justify-between gap-3 bg-background/60 p-3 rounded-xl border border-border/50">
                  <div className="text-lg font-mono font-bold text-foreground break-all">
                    {ensName}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(ensName!, 'ENS')}
                    className="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
                  >
                    {copied === 'ENS' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Legacy Address */}
          {address && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-muted/30 p-4 rounded-xl border border-border/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide block mb-1">
                    {t('onboarding.steps.deposit.legacyAddress')}
                  </span>
                  <div className="text-xs font-mono text-muted-foreground break-all">
                    {address}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(address, 'Address')}
                  className="shrink-0 h-11 w-11 rounded-lg"
                >
                  {copied === 'Address' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Coinbase Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card 
              className="border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 cursor-pointer hover:border-blue-500/50 transition-all active:scale-[0.98]" 
              onClick={() => navigate('/deposit/coinbase')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{t('onboarding.steps.deposit.fundWithCoinbase')}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t('onboarding.steps.deposit.fundWithCoinbaseDesc')}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      );
    }

    return null;
  };

  const renderBottomAction = () => {
    if (existingENS || (generatedENS && depositAddress)) {
      return (
        <div className="flex gap-3">
          <Button onClick={handleSkip} variant="outline" className="flex-1 py-6 rounded-xl min-h-[56px] active:scale-[0.98] transition-transform">
            {t('onboarding.steps.deposit.skip')}
          </Button>
          <Button onClick={onNext} className="flex-1 py-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 min-h-[56px] active:scale-[0.98] transition-transform">
            {t('onboarding.steps.deposit.continue')}
          </Button>
        </div>
      );
    }

    if (!existingENS && !generatedENS && !isLoading) {
      return (
        <Button onClick={handleSkip} variant="ghost" className="w-full text-muted-foreground min-h-[44px]">
          {t('onboarding.steps.deposit.skipThisStep')}
        </Button>
      );
    }

    return null;
  };

  return (
    <OnboardingLayout 
      backgroundVariant="emerald"
      bottomAction={renderBottomAction()}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="flex items-center px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl min-h-[44px] min-w-[44px]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-semibold text-foreground">
              {t('onboarding.steps.deposit.title')}
            </h1>
            <div className="mt-2">
              <ProgressBar currentStep={3} totalSteps={4} />
            </div>
          </div>
          
          <div className="w-11" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>
    </OnboardingLayout>
  );
};
