import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface AnimatedRoutesProps {
  children: React.ReactNode;
}

// Transitions optimisées pour fluidité
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Transitions désactivées pour reduced motion
const reducedVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
};

const pageTransition = {
  duration: 0.12, // Réduit de 0.15 à 0.12 pour plus de fluidité
  ease: 'easeOut',
};

const instantTransition = {
  duration: 0,
};

/**
 * Wrapper component that adds smooth page transitions
 * Uses popLayout mode to prevent full unmounts and preserve shell
 * Respects user's reduced motion preference
 */
export function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Enable scroll restoration for native app feel
  useScrollRestoration();

  // If user prefers reduced motion, render without AnimatePresence
  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
