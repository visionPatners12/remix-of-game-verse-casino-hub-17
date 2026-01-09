// Token approval utilities for Polymarket trading

import { encodeFunctionData, createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';
import { OperationType } from '../types/trading';
import {
  USDC_E_ADDRESS,
  CTF_CONTRACT_ADDRESS,
  USDC_SPENDERS,
  CTF_OPERATORS,
  MAX_UINT256,
} from '../constants/contracts';
import type { ApprovalTransaction, ApprovalStatus } from '../types/trading';
import { logger } from '@/utils/logger';

// ABI fragments for viem
const erc20ApproveAbi = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

const erc1155ApprovalAbi = [
  {
    name: 'setApprovalForAll',
    type: 'function',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    outputs: [],
  },
  {
    name: 'isApprovedForAll',
    type: 'function',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
] as const;

// Create public client for reading chain data
const publicClient = createPublicClient({
  chain: polygon,
  transport: http('https://polygon-rpc.com'),
});

/**
 * Creates all approval transactions needed for trading
 * - USDC.e approvals for exchange contracts
 * - CTF (ERC-1155) approvals for operators
 */
export function createAllApprovalTxs(): ApprovalTransaction[] {
  const txs: ApprovalTransaction[] = [];

  // ERC-20 USDC.e approvals
  for (const spender of USDC_SPENDERS) {
    const data = encodeFunctionData({
      abi: erc20ApproveAbi,
      functionName: 'approve',
      args: [spender as `0x${string}`, BigInt(MAX_UINT256)],
    });
    
    txs.push({
      to: USDC_E_ADDRESS,
      data,
      value: '0',
      operation: OperationType.Call,
    });
  }

  // ERC-1155 CTF approvals
  for (const operator of CTF_OPERATORS) {
    const data = encodeFunctionData({
      abi: erc1155ApprovalAbi,
      functionName: 'setApprovalForAll',
      args: [operator as `0x${string}`, true],
    });
    
    txs.push({
      to: CTF_CONTRACT_ADDRESS,
      data,
      value: '0',
      operation: OperationType.Call,
    });
  }

  logger.info('[Approvals] Created', txs.length, 'approval transactions');
  return txs;
}

/**
 * Checks if all required approvals are set for a given Safe address
 */
export async function checkAllApprovals(safeAddress: string): Promise<ApprovalStatus> {
  const status: ApprovalStatus = {
    allApproved: true,
    usdcApprovals: {},
    ctfApprovals: {},
  };

  try {
    // Check USDC.e approvals
    for (const spender of USDC_SPENDERS) {
      // Use any type to bypass strict viem typing issues with newer versions
      const allowance = await (publicClient as any).readContract({
        address: USDC_E_ADDRESS as `0x${string}`,
        abi: erc20ApproveAbi,
        functionName: 'allowance',
        args: [safeAddress as `0x${string}`, spender as `0x${string}`],
      });
      
      const approved = BigInt(allowance) > BigInt(0);
      status.usdcApprovals[spender] = approved;
      if (!approved) status.allApproved = false;
    }

    // Check CTF approvals
    for (const operator of CTF_OPERATORS) {
      const result = await (publicClient as any).readContract({
        address: CTF_CONTRACT_ADDRESS as `0x${string}`,
        abi: erc1155ApprovalAbi,
        functionName: 'isApprovedForAll',
        args: [safeAddress as `0x${string}`, operator as `0x${string}`],
      });
      
      const approved = Boolean(result);
      status.ctfApprovals[operator] = approved;
      if (!approved) status.allApproved = false;
    }

    logger.info('[Approvals] Status:', status.allApproved ? 'All approved' : 'Missing approvals');
  } catch (error) {
    logger.error('[Approvals] Failed to check approvals:', error);
    status.allApproved = false;
  }

  return status;
}
