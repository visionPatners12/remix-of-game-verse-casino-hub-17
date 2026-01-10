import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gamepad2, Wallet, Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { motion } from 'framer-motion';

import { useOnboarding } from '../../hooks';
import { OnboardingStepProps } from '../../types';

export function WelcomeStep({ onNext }: OnboardingStepProps) {
  const { t } = useTranslation('auth');
  const { user } = useAuth();
  const { setOnboardingProgress } = useOnboarding();
  
  const isWalletUser = user?.user_metadata?.auth_method === 'wallet';

  const steps = [
    {
      icon: Gamepad2,
      title: 'Create Your Profile',
      description: 'Set up your gaming identity',
      gradient: 'from-primary to-primary/70'
    },
    {
      icon: Wallet,
      title: 'Secure Your Account',
      description: 'Set up your PIN for instant transactions',
      gradient: 'from-accent to-accent/70'
    },
    {
      icon: Trophy,
      title: 'Start Playing',
      description: 'Join games and win USDT rewards',
      gradient: 'from-emerald-500 to-emerald-600'
    }
  ];

  const logoUrl = "/pryzen-logo.png";

  const handleNext = () => {
    setOnboardingProgress('profile');
    onNext?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col relative safe-area-top overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-40 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="flex items-center justify-center px-4 py-4">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img 
              src={logoUrl} 
              alt="PRYZEN" 
              className="h-10 object-contain" 
            />
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 pb-safe overflow-y-auto relative z-10">
        <div className="max-w-sm mx-auto space-y-8">
          {/* Hero Section */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary">On-Chain Gaming</span>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              {isWalletUser ? 'Wallet Connected!' : 'Welcome to PRYZEN'}
            </h1>
            
            <p className="text-muted-foreground text-base leading-relaxed">
              {isWalletUser 
                ? 'Your wallet is ready. Let\'s set up your gaming profile.'
                : 'Play Ludo, win USDT. Real games, real rewards, instant payouts.'
              }
            </p>

            {isWalletUser && (
              <motion.div 
                className="flex items-center justify-center gap-2 mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-500 font-medium">Wallet Successfully Connected</span>
              </motion.div>
            )}
          </motion.div>

          {/* Steps Section */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-foreground">Quick Setup</h2>
              <p className="text-muted-foreground text-sm">3 simple steps to start playing</p>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/30 hover:border-primary/30 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} text-white shadow-lg`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-foreground font-semibold text-base">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div 
            className="pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-6 rounded-2xl text-lg transition-all duration-200 shadow-lg shadow-primary/25"
            >
              Let's Go
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              Takes less than 2 minutes
            </p>
          </motion.div>

          {/* Features badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {['100% On-Chain', 'Instant Payouts', 'USDT Rewards'].map((badge, i) => (
              <span 
                key={i}
                className="px-3 py-1.5 text-xs font-medium bg-muted/50 text-muted-foreground rounded-full border border-border/30"
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
