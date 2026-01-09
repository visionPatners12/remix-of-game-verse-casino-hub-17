import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

interface AnimatedRoutesProps {
  children: React.ReactNode;
}

// Transitions simplifiées pour éviter les remounts agressifs
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = {
  duration: 0.15,
  ease: 'easeOut',
};

/**
 * Wrapper component that adds smooth page transitions
 * Uses popLayout mode to prevent full unmounts and preserve shell
 */
export function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();
  
  // Enable scroll restoration for native app feel
  useScrollRestoration();

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
