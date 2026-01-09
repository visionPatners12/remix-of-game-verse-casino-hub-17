import { useEffect, useLayoutEffect } from 'react';
import { useNavigationVisibility } from '@/contexts/NavigationVisibilityContext';

// useLayoutEffect runs synchronously after DOM mutations but before paint
const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useHideNavigation(hide: boolean = true) {
  const { setHideNavigation } = useNavigationVisibility();
  
  useIsomorphicLayoutEffect(() => {
    if (hide) {
      setHideNavigation(true);
      return () => setHideNavigation(false);
    }
  }, [hide, setHideNavigation]);
}
