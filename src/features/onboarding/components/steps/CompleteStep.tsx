import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, Heart, Sparkles, Wallet, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useOnboarding } from '../../hooks';
import { OnboardingStepProps } from '../../types';
import { supabase } from '@/integrations/supabase/client';

export function CompleteStep({ onNext, onBack }: OnboardingStepProps) {
  const { t } = useTranslation('auth');
  const { user } = useAuth();
  const { updateOnboardingStatus } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  
  const isWalletUser = user?.user_metadata?.auth_method === 'wallet';

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await updateOnboardingStatus(true);
      
      // Send welcome email
      if (user?.email) {
        try {
          await supabase.functions.invoke('send-email', {
            body: {
              template: 'welcome',
              to: user.email,
              data: {
                firstName: user.user_metadata?.first_name,
                username: user.user_metadata?.username,
                isWalletUser: isWalletUser
              }
            }
          });
        } catch (emailError) {
          console.error('❌ Failed to send welcome email:', emailError);
          // Don't block onboarding completion if email fails
        }
      }
      
      onNext?.();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logoUrl = "/pryzen-logo.png";

  const features = isWalletUser ? [
    {
      icon: Wallet,
      title: t('onboarding.steps.complete.walletConnected'),
      description: t('onboarding.steps.complete.walletConnectedDesc')
    },
    {
      icon: Heart,
      title: t('onboarding.steps.complete.sportsSelected'),
      description: t('onboarding.steps.complete.sportsSelectedDesc')
    },
    {
      icon: Sparkles,
      title: t('onboarding.steps.complete.web3Enabled'),
      description: t('onboarding.steps.complete.web3EnabledDesc')
    }
  ] : [
    {
      icon: User,
      title: t('onboarding.steps.complete.profileSetUp'),
      description: t('onboarding.steps.complete.profileSetUpDesc')
    },
    {
      icon: Heart,
      title: t('onboarding.steps.complete.sportsSelected'),
      description: t('onboarding.steps.complete.personalizedContent')
    },
    {
      icon: Sparkles,
      title: t('onboarding.steps.complete.readyToPlay'),
      description: t('onboarding.steps.complete.readyToPlayDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col relative safe-area-top">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/20">
        <div className="flex items-center px-4 py-3">
          <Button variant="ghost" size="lg" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-semibold text-foreground">{t('onboarding.steps.complete.title')}</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-primary"></div>
            </div>
          </div>
          
          <div className="w-[44px]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              {isWalletUser ? t('onboarding.steps.complete.web3Complete') : t('onboarding.steps.complete.setupComplete')}
            </p>
          </div>

          {/* Success Section */}
          <div className="text-center mb-8">
            <div className="relative mb-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              {isWalletUser ? t('onboarding.steps.complete.readyToBet') : t('onboarding.steps.complete.allSet')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isWalletUser 
                ? t('onboarding.steps.complete.startBetting')
                : t('onboarding.steps.complete.discoverExperience')
              }
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-lg p-3 border border-border">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-medium text-sm">{feature.title}</h3>
                    <p className="text-muted-foreground text-xs">{feature.description}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-background/95 backdrop-blur-md border-t border-border/20">
        <div className="max-w-sm mx-auto space-y-3">
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className="w-full min-h-[52px] text-base font-semibold rounded-xl"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                {t('onboarding.steps.complete.settingUp')}
              </>
            ) : (
              <>
                {isWalletUser ? t('onboarding.steps.complete.startBettingBtn') : t('onboarding.steps.complete.getStarted')}
                {isWalletUser ? <Wallet className="w-5 h-5 ml-2" /> : <Sparkles className="w-5 h-5 ml-2" />}
              </>
            )}
          </Button>
          
          <p className="text-center text-muted-foreground text-xs">
            {isWalletUser ? t('onboarding.steps.complete.welcomeWeb3') : t('onboarding.steps.complete.welcomePryzen')}
          </p>
        </div>
      </div>
    </div>
  );
}
