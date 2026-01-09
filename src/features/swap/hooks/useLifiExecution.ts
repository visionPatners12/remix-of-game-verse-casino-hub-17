// Hook for executing LI.FI swaps
import { useState, useCallback } from 'react';
import { executeRoute, type Route, type ExecutionOptions } from '@lifi/sdk';
import type { SwapExecutionStep, SwapStatus } from '../types';
import { toast } from 'sonner';

interface UseLifiExecutionOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function useLifiExecution({ onSuccess, onError }: UseLifiExecutionOptions = {}) {
  const [status, setStatus] = useState<SwapStatus>('idle');
  const [steps, setSteps] = useState<SwapExecutionStep[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (route: Route) => {
    if (!route) {
      setError('Missing route');
      return;
    }

    setStatus('executing');
    setError(null);
    setTxHash(null);
    setSteps([]);

    // Initialize steps based on route
    const initialSteps: SwapExecutionStep[] = route.steps.map((step, index) => ({
      id: `step-${index}`,
      type: step.type === 'lifi' ? 'bridge' : 'swap',
      status: 'pending',
      message: `${step.type === 'lifi' ? 'Bridging' : 'Swapping'} via ${step.tool}`,
    }));
    
    // Add approval step if needed
    initialSteps.unshift({
      id: 'approval',
      type: 'approval',
      status: 'pending',
      message: 'Approving token spend',
    });
    
    setSteps(initialSteps);

    try {
      const executionOptions: ExecutionOptions = {
        updateRouteHook: (updatedRoute) => {
          // Update steps based on route progress
          const newSteps = [...initialSteps];
          
          for (const step of updatedRoute.steps) {
            const stepIndex = initialSteps.findIndex(s => s.message.includes(step.tool));
            if (stepIndex !== -1 && step.execution) {
              const executionStatus = step.execution.status;
              newSteps[stepIndex] = {
                ...newSteps[stepIndex],
                status: executionStatus === 'DONE' ? 'completed' : 
                        executionStatus === 'FAILED' ? 'failed' : 
                        executionStatus === 'PENDING' ? 'active' : 'pending',
                txHash: step.execution.process?.[0]?.txHash,
              };
              
              if (step.execution.process?.[0]?.txHash) {
                setTxHash(step.execution.process[0].txHash);
              }
            }
          }
          
          setSteps(newSteps);
        },
        acceptExchangeRateUpdateHook: async (params) => {
          // Show rate update toast and wait for user decision
          return new Promise((resolve) => {
            const oldRate = Number(params.oldToAmount) / 10 ** params.toToken.decimals;
            const newRate = Number(params.newToAmount) / 10 ** params.toToken.decimals;
            const difference = ((newRate - oldRate) / oldRate * 100).toFixed(2);
            
            toast.info(`Rate updated: ${difference}% change`, {
              description: 'The exchange rate has changed. Accept to continue.',
              action: {
                label: 'Accept',
                onClick: () => resolve(true),
              },
              cancel: {
                label: 'Reject',
                onClick: () => resolve(false),
              },
              duration: 30000,
            });
          });
        },
      };

      await executeRoute(route, executionOptions);

      // Mark all steps as completed
      setSteps(prev => prev.map(s => ({ ...s, status: 'completed' as const })));
      setStatus('success');
      
      toast.success('Swap completed successfully!');
      onSuccess?.(txHash || '');
      
    } catch (err: any) {
      console.error('Swap execution error:', err);
      setError(err.message || 'Swap failed');
      setStatus('error');
      
      // Mark current step as failed
      setSteps(prev => prev.map(s => 
        s.status === 'active' ? { ...s, status: 'failed' as const } : s
      ));
      
      toast.error('Swap failed', {
        description: err.message || 'An error occurred during the swap',
      });
      
      onError?.(err);
    }
  }, [onSuccess, onError, txHash]);

  const reset = useCallback(() => {
    setStatus('idle');
    setSteps([]);
    setTxHash(null);
    setError(null);
  }, []);

  return {
    status,
    steps,
    txHash,
    error,
    execute,
    reset,
    isExecuting: status === 'executing' || status === 'waiting-signature' || status === 'pending',
  };
}
