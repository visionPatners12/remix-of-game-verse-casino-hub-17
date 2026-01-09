import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Heart, CheckCircle, Wallet } from 'lucide-react';
import { useAuth } from '@/features/auth';

import { useOnboarding } from '../../hooks';
import { OnboardingStepProps } from '../../types';

export function WelcomeStep({ onNext }: OnboardingStepProps) {
  const { t } = useTranslation('auth');
  const { user } = useAuth();
  const { setOnboardingProgress } = useOnboarding();
  
  const isWalletUser = user?.user_metadata?.auth_method === 'wallet';

  const steps = [
    {
      icon: User,
      title: t('onboarding.steps.welcome.profileSetup'),
      description: isWalletUser 
        ? t('onboarding.steps.welcome.profileSetupDescWallet')
        : t('onboarding.steps.welcome.profileSetupDescDefault')
    },
    {
      icon: Heart,
      title: t('onboarding.steps.welcome.favoriteSport'),
      description: isWalletUser 
        ? t('onboarding.steps.welcome.favoriteSportDescWallet')
        : t('onboarding.steps.welcome.favoriteSportDescDefault')
    },
    {
      icon: CheckCircle,
      title: t('onboarding.steps.welcome.letsGo'),
      description: isWalletUser 
        ? t('onboarding.steps.welcome.letsGoDescWallet')
        : t('onboarding.steps.welcome.letsGoDescDefault')
    }
  ];

  const logoUrl = "/pryzen-logo.png";

  const handleNext = () => {
    setOnboardingProgress('profile');
    onNext?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col relative safe-area-top">
      {/* Header unifié */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/20">
        <div className="flex items-center justify-center px-4 py-3">
          <div className="flex items-center gap-3">
            <img 
              src={logoUrl} 
              alt="PRYZEN" 
              className="h-8 object-contain" 
            />
            <h1 className="text-lg font-semibold text-foreground">{t('onboarding.steps.welcome.title')}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-safe overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <div className="text-2xl font-bold text-foreground leading-tight">
              {isWalletUser ? t('onboarding.steps.welcome.walletConnected') : t('onboarding.steps.welcome.welcomeTo')}
            </div>
            <p className="text-muted-foreground text-base leading-relaxed">
              {isWalletUser 
                ? t('onboarding.steps.welcome.walletSubtitle')
                : t('onboarding.steps.welcome.subtitle')
              }
            </p>
            {isWalletUser && (
              <div className="flex items-center justify-center space-x-2 mt-3 p-3 bg-muted/20 rounded-xl border border-border/20">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">{t('onboarding.steps.welcome.walletSuccess')}</span>
              </div>
            )}
          </div>

          {/* Steps Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">{t('onboarding.steps.welcome.simpleSteps')}</h2>
              <p className="text-muted-foreground text-sm">{t('onboarding.steps.welcome.simpleStepsSubtitle')}</p>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className="bg-muted/20 backdrop-blur-sm rounded-2xl p-4 border border-border/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-foreground font-semibold text-base">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                    <div className="text-primary font-bold text-lg bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress and CTA */}
          <div className="space-y-6">
            
            
            <Button
              onClick={handleNext}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-2xl text-lg transition-all duration-200"
            >
              {t('onboarding.steps.welcome.startSetup')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Footer info */}
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('onboarding.steps.welcome.footer')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
