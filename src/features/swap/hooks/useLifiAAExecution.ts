// Hook for executing LI.FI swaps via Privy Smart Account (Account Abstraction)
import { useState, useCallback } from 'react';
import { getStepTransaction, getStatus, type Route } from '@lifi/sdk';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { encodeFunctionData, erc20Abi, createPublicClient, http, type Chain } from 'viem';
import { polygon, mainnet, arbitrum, optimism, base } from 'viem/chains';
import type { SwapExecutionStep, SwapStatus } from '../types';
import { toast } from 'sonner';

interface UseLifiAAExecutionOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

// Chain mapping for viem
const CHAIN_MAP: Record<number, Chain> = {
  [polygon.id]: polygon,
  [mainnet.id]: mainnet,
  [arbitrum.id]: arbitrum,
  [optimism.id]: optimism,
  [base.id]: base,
};

// Native token address (zero address)
const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';

// Check ERC20 allowance
async function checkAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  chainId: number
): Promise<bigint> {
  const chain = CHAIN_MAP[chainId];
  if (!chain) {
    console.warn(`Chain ${chainId} not supported for allowance check`);
    return BigInt(0);
  }

  try {
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // @ts-expect-error - viem type mismatch with erc20Abi
    const allowance = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`],
    });

    return allowance as bigint;
  } catch (err) {
    console.error('Error checking allowance:', err);
    return BigInt(0);
  }
}

// Poll LI.FI status until done
async function pollStatus(
  txHash: string,
  fromChainId: number,
  toChainId: number,
  bridge: string,
  maxAttempts = 60
): Promise<'DONE' | 'FAILED' | 'PENDING'> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await getStatus({
        txHash,
        fromChain: fromChainId,
        toChain: toChainId,
        bridge,
      });

      if (result.status === 'DONE' || result.status === 'FAILED') {
        return result.status;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (err) {
      console.warn('Status poll error:', err);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return 'PENDING';
}

export function useLifiAAExecution({ onSuccess, onError }: UseLifiAAExecutionOptions = {}) {
  const { client: smartWalletClient } = useSmartWallets();
  const [status, setStatus] = useState<SwapStatus>('idle');
  const [steps, setSteps] = useState<SwapExecutionStep[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (route: Route, fromAddress: string) => {
    if (!route) {
      setError('Missing route');
      return;
    }

    if (!smartWalletClient) {
      setError('Smart Wallet not available. Please try again.');
      return;
    }

    setStatus('executing');
    setError(null);
    setTxHash(null);

    // Initialize step tracking
    const initialSteps: SwapExecutionStep[] = route.steps.map((step, index) => ({
      id: `step-${index}`,
      type: step.type === 'lifi' ? 'bridge' : 'swap',
      status: 'pending',
      message: `${step.type === 'lifi' ? 'Bridging' : 'Swapping'} via ${step.tool}`,
    }));
    setSteps(initialSteps);

    let lastTxHash: string | null = null;

    try {
      for (let i = 0; i < route.steps.length; i++) {
        const step = route.steps[i];

        // Update step status to active
        setSteps(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: 'active' } : s
        ));

        // Get transaction data from LI.FI
        const stepTx = await getStepTransaction(step);

        if (!stepTx.transactionRequest) {
          throw new Error(`No transaction request for step ${i + 1}`);
        }

        const { to, data, value } = stepTx.transactionRequest;

        if (!to || !data) {
          throw new Error(`Invalid transaction data for step ${i + 1}`);
        }

        // Build calls array
        const calls: Array<{ to: `0x${string}`; data?: `0x${string}`; value?: bigint }> = [];

        // Check if we need to approve (for ERC20 tokens, not native)
        const fromTokenAddress = step.action.fromToken.address;
        const isNativeToken = fromTokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase();

        if (!isNativeToken) {
          const allowance = await checkAllowance(
            fromTokenAddress,
            fromAddress,
            to as string,
            step.action.fromChainId
          );

          const requiredAmount = BigInt(step.action.fromAmount);

          if (allowance < requiredAmount) {
            // Add approval call to the batch
            calls.push({
              to: fromTokenAddress as `0x${string}`,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'approve',
                args: [to as `0x${string}`, requiredAmount],
              }),
            });

            toast.info('Batching approval with swap', {
              description: 'Token approval will be included in the transaction',
            });
          }
        }

        // Add the main swap/bridge call
        calls.push({
          to: to as `0x${string}`,
          data: data as `0x${string}`,
          value: value ? BigInt(value.toString()) : undefined,
        });

        // Execute via Smart Wallet (batched if approval needed)
        // @ts-expect-error - Privy smart wallet client typing differs from viem
        const hash = await smartWalletClient.sendTransaction({
          account: smartWalletClient.account,
          calls,
        });

        lastTxHash = hash;
        setTxHash(hash);

        // Update step with tx hash
        setSteps(prev => prev.map((s, idx) =>
          idx === i ? { ...s, txHash: hash } : s
        ));

        // For cross-chain transactions, poll status
        if (step.action.fromChainId !== step.action.toChainId) {
          toast.info('Waiting for bridge confirmation...', {
            description: 'Cross-chain transfers may take a few minutes',
          });

          const finalStatus = await pollStatus(
            hash,
            step.action.fromChainId,
            step.action.toChainId,
            step.tool
          );

          if (finalStatus === 'FAILED') {
            throw new Error(`Bridge failed for step ${i + 1}`);
          }
        }

        // Mark step as completed
        setSteps(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: 'completed' } : s
        ));
      }

      // All steps completed
      setStatus('success');
      toast.success('Swap completed successfully!');
      onSuccess?.(lastTxHash || '');

    } catch (err: any) {
      console.error('AA Swap execution error:', err);

      // Provide specific error messages for common AA issues
      let errorMessage = err.message || 'Swap failed';

      if (err.message?.includes('signature') || err.message?.includes('signer')) {
        errorMessage = 'This route requires an external wallet signature. Please try a different route.';
      } else if (err.message?.includes('paymaster')) {
        errorMessage = 'Gas sponsorship unavailable. Please ensure you have funds for gas.';
      } else if (err.message?.includes('rejected') || err.message?.includes('denied')) {
        errorMessage = 'Transaction was rejected';
      }

      setError(errorMessage);
      setStatus('error');

      // Mark current step as failed
      setSteps(prev => prev.map(s =>
        s.status === 'active' ? { ...s, status: 'failed' } : s
      ));

      toast.error('Swap failed', {
        description: errorMessage,
      });

      onError?.(err);
    }
  }, [smartWalletClient, onSuccess, onError]);

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
    isExecuting: status === 'executing',
    isAAReady: !!smartWalletClient,
  };
}
