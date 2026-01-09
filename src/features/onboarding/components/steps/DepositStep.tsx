import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, CheckCircle, AlertCircle, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingStepProps } from '../../types';
import { useENSGeneration } from '../../hooks/useENSGeneration';
import { useUserProfile } from '@/features/profile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DepositQRCode } from '@/features/deposit/components/DepositQRCode';

// ProgressBar Component
const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-1 w-8 rounded-full transition-colors ${
            index < currentStep ? 'bg-primary' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );
};

export const DepositStep = ({ onNext, onBack }: OnboardingStepProps) => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { autoGenerateENSAndDeposit, isLoading, generatedENS, depositAddress, generationError, resetENS } = useENSGeneration();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [existingENS, setExistingENS] = useState<string | null>(null);
  const [existingWallet, setExistingWallet] = useState<string | null>(null);

  // Check for existing ENS and auto-generate on component mount
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
    toast({
      title: t('onboarding.steps.deposit.copied'),
      description: t('onboarding.steps.deposit.copiedDesc', { label }),
    });
  };

  const handleSkip = () => {
    resetENS();
    onNext?.();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-xl font-semibold">{t('onboarding.steps.deposit.generating')}</h3>
              <p className="text-muted-foreground">
                {t('onboarding.steps.deposit.generatingSubtitle')}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (generationError) {
      return (
        <Card className="border-2 border-destructive/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <h3 className="text-xl font-semibold">{t('onboarding.steps.deposit.serviceUnavailable')}</h3>
              <p className="text-muted-foreground">
                {t('onboarding.steps.deposit.serviceUnavailableSubtitle')}
              </p>
              <Button onClick={handleSkip} className="mt-4">
                {t('onboarding.steps.deposit.skipThisStep')}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (existingENS || (generatedENS && depositAddress)) {
      const ensName = existingENS || generatedENS;
      const address = existingWallet || depositAddress;
      
      return (
        <div className="space-y-5">
          {/* QR Code Section */}
          {address && (
            <DepositQRCode address={address} cryptoSymbol="USDT" />
          )}

          {/* NEW ADDRESS - ENS Section */}
          <Card className="border-2 border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-green-500" />
                <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full font-semibold uppercase tracking-wide">
                  {t('onboarding.steps.deposit.newAddress')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {t('onboarding.steps.deposit.newAddressDesc')}
              </p>
              <div className="flex items-center justify-between gap-3 bg-background/50 p-3 rounded-lg border border-border/50">
                <div className="text-lg font-mono font-bold text-primary break-all">
                  {ensName}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(ensName!, 'ENS Address')}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* LEGACY ADDRESS - Classic Wallet */}
          {address && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {t('onboarding.steps.deposit.legacyAddress')}
                </span>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-mono text-muted-foreground break-all">
                    {address}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(address, 'Legacy Address')}
                    className="shrink-0 h-8"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Coinbase Partner Section */}
          <Card className="border border-blue-500/30 bg-blue-500/5 cursor-pointer hover:bg-blue-500/10 transition-colors" onClick={() => navigate('/deposit/coinbase')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{t('onboarding.steps.deposit.fundWithCoinbase')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('onboarding.steps.deposit.fundWithCoinbaseDesc')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('onboarding.steps.deposit.open')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSkip} variant="outline" className="flex-1">
              {t('onboarding.steps.deposit.skip')}
            </Button>
            <Button onClick={onNext} className="flex-1">
              {t('onboarding.steps.deposit.continue')}
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col safe-area-top">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/20">
        <div className="relative flex items-center px-4 py-3">
          <Button variant="ghost" size="lg" onClick={onBack} className="z-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="absolute inset-0 flex items-center justify-center px-4 py-3">
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">
                {t('onboarding.steps.deposit.title')}
              </h1>
              <ProgressBar currentStep={6} totalSteps={6} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">

          {renderContent()}

          {!existingENS && !generatedENS && !isLoading && (
            <div className="text-center">
              <Button onClick={handleSkip} variant="ghost" className="text-muted-foreground">
                {t('onboarding.steps.deposit.skipThisStep')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
