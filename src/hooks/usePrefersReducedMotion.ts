import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled "reduce motion" in system settings
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check on initial render (SSR safe)
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Reduced motion variants for Framer Motion
 * Use when animations should be disabled
 */
export const reducedMotionVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
};

/**
 * Get appropriate motion variants based on user preference
 * @param fullVariants - The full animation variants to use when motion is allowed
 * @param prefersReduced - Whether user prefers reduced motion
 */
export function getMotionVariants<T extends Record<string, unknown>>(
  fullVariants: T,
  prefersReduced: boolean
): T | typeof reducedMotionVariants {
  return prefersReduced ? reducedMotionVariants : fullVariants;
}

/**
 * Get transition config based on user preference
 * Returns instant transition if reduced motion is preferred
 */
export function getMotionTransition(
  fullTransition: { duration?: number; ease?: string | number[] },
  prefersReduced: boolean
) {
  if (prefersReduced) {
    return { duration: 0 };
  }
  return fullTransition;
}
