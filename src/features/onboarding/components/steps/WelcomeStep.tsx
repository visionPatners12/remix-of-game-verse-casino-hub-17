import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gamepad2, Shield, Wallet, Zap, Star } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { motion } from 'framer-motion';
import { useOnboarding } from '../../hooks';
import { OnboardingStepProps } from '../../types';

export function WelcomeStep({ onNext }: OnboardingStepProps) {
  const { user } = useAuth();
  const { setOnboardingProgress } = useOnboarding();
  
  const isWalletUser = user?.user_metadata?.auth_method === 'wallet';

  const steps = [
    {
      icon: Gamepad2,
      title: 'Create Profile',
      description: 'Set up your gaming identity',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: Shield,
      title: 'Secure Account',
      description: 'Create your transaction PIN',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: Wallet,
      title: 'Fund & Play',
      description: 'Deposit USDC and start winning',
      color: 'from-emerald-500 to-green-600'
    }
  ];

  const handleNext = () => {
    setOnboardingProgress('profile');
    onNext?.();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Premium animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div 
          className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-accent/20 to-accent/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 px-5 py-8 pb-safe overflow-y-auto relative z-10 flex flex-col justify-center">
        <div className="max-w-md mx-auto space-y-8 w-full">
          {/* Logo & Hero */}
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo with glow */}
            <motion.div
              className="relative inline-block"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
              <img 
                src="/pryzen-logo.png" 
                alt="PRYZEN" 
                className="h-16 object-contain relative z-10" 
              />
            </motion.div>
            
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-primary">On-Chain Gaming</span>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-4xl font-bold text-foreground leading-tight mb-3">
                {isWalletUser ? (
                  <>Wallet <span className="text-primary">Connected!</span></>
                ) : (
                  <>Welcome to <span className="text-primary">PRYZEN</span></>
                )}
              </h1>
              
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xs mx-auto">
                {isWalletUser 
                  ? "Your wallet is ready. Let's complete your profile."
                  : "Play Ludo, win USDC. Real games, real rewards."
                }
              </p>
            </motion.div>

            {/* Wallet connected badge */}
            {isWalletUser && (
              <motion.div 
                className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-emerald-500 font-semibold">Wallet Successfully Connected</span>
              </motion.div>
            )}
          </motion.div>

          {/* Steps Cards */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="group relative bg-card/60 backdrop-blur-xl rounded-2xl p-4 border border-border/50 overflow-hidden"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: 'hsl(var(--primary) / 0.3)' }}
              >
                {/* Subtle gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-4 relative z-10">
                  {/* Icon with gradient */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-semibold text-base">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                  
                  {/* Step number */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold text-sm border border-border">
                    {index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="space-y-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-6 rounded-2xl text-lg shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Let's Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              ⚡ Takes less than 2 minutes
            </p>
          </motion.div>

          {/* Feature badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[
              { icon: Star, label: '100% On-Chain' },
              { icon: Zap, label: 'Instant Payouts' },
              { icon: Wallet, label: 'USDC Rewards' }
            ].map((badge, i) => (
              <span 
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted/50 text-muted-foreground rounded-full border border-border/50"
              >
                <badge.icon className="w-3 h-3" />
                {badge.label}
              </span>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
