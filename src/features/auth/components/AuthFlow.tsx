import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IntroSlider } from './IntroSlider';
import { PrivyLoginScreen } from './PrivyLoginScreen';
import { logger } from '@/utils/logger';

const INTRO_SEEN_KEY = 'pryzen_intro_seen';

interface AuthFlowProps {
  logoUrl?: string;
}

export function AuthFlow({ logoUrl }: AuthFlowProps) {
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  const [searchParams] = useSearchParams();

  // Check if user has seen intro before
  useEffect(() => {
    // Handle intro reset via URL parameter
    const introParam = searchParams.get('intro');
    if (introParam === 'reset') {
      logger.auth('🔄 Resetting intro via URL parameter');
      localStorage.removeItem(INTRO_SEEN_KEY);
    }

    const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    logger.auth('🔍 Checking intro status:', { hasSeenIntro, key: INTRO_SEEN_KEY });
    setShowIntro(!hasSeenIntro);
  }, [searchParams]);

  const handleIntroComplete = () => {
    logger.auth('✅ Intro completed');
    localStorage.setItem(INTRO_SEEN_KEY, 'true');
    setShowIntro(false);
  };

  const handleSkip = () => {
    logger.auth('⏭️ Intro skipped');
    localStorage.setItem(INTRO_SEEN_KEY, 'true');
    setShowIntro(false);
  };

  // Loading state while checking localStorage
  if (showIntro === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-6"
        >
          {/* Logo */}
          <motion.img
            src="/pryzen-logo.png"
            alt="PRYZEN"
            className="h-20 object-contain"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.98, 1, 0.98]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <IntroSlider 
            onComplete={handleIntroComplete} 
            onSkip={handleSkip} 
          />
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <PrivyLoginScreen logoUrl={logoUrl} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
