import { useState, useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface VisualViewportState {
  height: number;
  offsetTop: number;
  keyboardHeight: number;
  isKeyboardVisible: boolean;
  scrollY: number;
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    offsetTop: 0,
    keyboardHeight: 0,
    isKeyboardVisible: false,
    scrollY: 0,
  });

  useIsomorphicLayoutEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = vv.height;
      const keyboardHeight = Math.max(0, windowHeight - viewportHeight - vv.offsetTop);
      
      setState({
        height: viewportHeight,
        offsetTop: vv.offsetTop,
        keyboardHeight,
        isKeyboardVisible: keyboardHeight > 100,
        scrollY: vv.pageTop || 0,
      });
    };

    handleResize();
    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, []);

  return state;
}
