import { useState, useCallback } from 'react';

export interface ModalState {
  isOpen: boolean;
  data: any;
  step: number;
  isLoading: boolean;
}

export interface ModalActions {
  open: (data?: any) => void;
  close: () => void;
  toggle: () => void;
  setData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
}

export interface UseModalStateOptions {
  initialStep?: number;
  maxSteps?: number;
  onOpen?: (data?: any) => void;
  onClose?: () => void;
}

export const useModalState = (options: UseModalStateOptions = {}) => {
  const { 
    initialStep = 0, 
    maxSteps = 1, 
    onOpen, 
    onClose 
  } = options;

  const [state, setState] = useState<ModalState>({
    isOpen: false,
    data: null,
    step: initialStep,
    isLoading: false,
  });

  const open = useCallback((data?: any) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      data: data || null,
      step: initialStep,
    }));
    onOpen?.(data);
  }, [initialStep, onOpen]);

  const close = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      data: null,
      step: initialStep,
      isLoading: false,
    }));
    onClose?.();
  }, [initialStep, onClose]);

  const toggle = useCallback(() => {
    state.isOpen ? close() : open();
  }, [state.isOpen, open, close]);

  const setData = useCallback((data: any) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: Math.min(prev.step + 1, maxSteps - 1),
    }));
  }, [maxSteps]);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: Math.max(prev.step - 1, 0),
    }));
  }, []);

  const setStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      step: Math.max(0, Math.min(step, maxSteps - 1)),
    }));
  }, [maxSteps]);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const actions: ModalActions = {
    open,
    close,
    toggle,
    setData,
    nextStep,
    prevStep,
    setStep,
    setLoading,
  };

  return {
    state,
    actions,
    // Convenient computed values
    isFirstStep: state.step === 0,
    isLastStep: state.step === maxSteps - 1,
    canGoNext: state.step < maxSteps - 1,
    canGoPrev: state.step > 0,
  };
};