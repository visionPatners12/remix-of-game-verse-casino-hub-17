import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, Heart, Sparkles, Wallet, Loader2, ArrowLeft, Gamepad2, Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useOnboarding } from '../../hooks';
import { OnboardingStepProps } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

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

export function CompleteStep({ onNext, onBack }: OnboardingStepProps) {
  const { t } = useTranslation('auth');
  const { user } = useAuth();
  const { updateOnboardingStatus } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  
  const isWalletUser = user?.user_metadata?.auth_method === 'wallet';

  const triggerConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  React.useEffect(() => {
    // Trigger confetti on mount
    const timer = setTimeout(triggerConfetti, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await updateOnboardingStatus(true);
      
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
        }
      }
      
      triggerConfetti();
      onNext?.();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: User,
      title: 'Profile Created',
      description: 'Your gaming identity is ready',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: Trophy,
      title: 'Account Secured',
      description: 'PIN protection enabled',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: Gamepad2,
      title: 'Ready to Play',
      description: 'Join games and win USDC',
      color: 'from-emerald-500 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Celebration background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-green-500/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        {/* Floating stars */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 180, 360],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            <Sparkles className="w-4 h-4 text-accent/60" />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="flex items-center px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-semibold text-foreground">{t('onboarding.steps.complete.title')}</h1>
            <div className="mt-2">
              <ProgressBar currentStep={4} totalSteps={4} />
            </div>
          </div>
          
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-8 pb-32 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Success Animation */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="relative inline-block mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-emerald-500/40 blur-3xl rounded-full scale-150" />
              
              {/* Rotating ring */}
              <motion.div
                className="absolute inset-0 w-28 h-28 border-4 border-emerald-500/30 rounded-full"
                style={{ margin: '-4px' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Main icon */}
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center relative shadow-2xl shadow-emerald-500/40">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              
              {/* Sparkle decorations */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-accent" />
              </motion.div>
            </motion.div>
            
            <motion.h2 
              className="text-3xl font-bold text-foreground mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              You're All Set! 🎉
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Your PRYZEN account is ready
            </motion.p>
          </motion.div>

          {/* Features checklist */}
          <motion.div 
            className="space-y-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-card/60 backdrop-blur-xl rounded-2xl p-4 border border-border/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats preview */}
          <motion.div 
            className="grid grid-cols-3 gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            {[
              { label: 'Games Available', value: '4+' },
              { label: 'Active Players', value: '10K+' },
              { label: 'Paid Out', value: '$500K+' }
            ].map((stat, i) => (
              <div key={i} className="bg-card/60 backdrop-blur-xl rounded-xl p-3 text-center border border-border/50">
                <div className="text-xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-5 pb-safe bg-background/80 backdrop-blur-xl border-t border-border/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="max-w-md mx-auto space-y-3">
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className="w-full py-6 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/25"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                {t('onboarding.steps.complete.settingUp')}
              </>
            ) : (
              <>
                Start Playing
                <Zap className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          
          <p className="text-center text-muted-foreground text-xs">
            Welcome to the future of gaming 🚀
          </p>
        </div>
      </motion.div>
    </div>
  );
}
