// ============================================
// SINGLE SOURCE OF TRUTH FOR CHAIN CONFIGURATION
// ============================================
// All chain-related constants should be imported from this file.
// DO NOT hardcode chain IDs or names elsewhere in the codebase.

import { polygon, mainnet, arbitrum, optimism, base, bsc } from 'viem/chains';
import type { Chain } from 'viem';

// === DEFAULT CHAIN (Base) ===
export const DEFAULT_CHAIN = base;
export const DEFAULT_CHAIN_ID = base.id; // 8453
export const DEFAULT_CHAIN_NAME = 'Base';

// === SUPPORTED CHAINS ===
export const SUPPORTED_CHAINS = [base, polygon, mainnet, arbitrum, optimism] as const;
export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(c => c.id);

// === CHAIN MAP (for viem) ===
export const CHAIN_MAP: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [polygon.id]: polygon,
  [arbitrum.id]: arbitrum,
  [optimism.id]: optimism,
  [base.id]: base,
  [bsc.id]: bsc,
};

// === HELPER FUNCTIONS ===
export const getChainName = (chainId: number): string => {
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
};

export const getChainById = (chainId: number): Chain | undefined => {
  return CHAIN_MAP[chainId];
};

export const isChainSupported = (chainId: number): boolean => {
  return (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId);
};

// === CHAIN ICONS (for UI) ===
export const CHAIN_ICONS: Record<number, string> = {
  [base.id]: 'base',
  [polygon.id]: 'polygon',
  [mainnet.id]: 'ethereum',
  [arbitrum.id]: 'arbitrum',
  [optimism.id]: 'optimism',
  [bsc.id]: 'bsc',
};

// === USDC ADDRESSES PER CHAIN ===
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [polygon.id]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  [mainnet.id]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  [optimism.id]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
};

// === NATIVE TOKEN SYMBOLS ===
export const NATIVE_SYMBOLS: Record<number, string> = {
  [base.id]: 'ETH',
  [polygon.id]: 'POL',
  [mainnet.id]: 'ETH',
  [arbitrum.id]: 'ETH',
  [optimism.id]: 'ETH',
  [bsc.id]: 'BNB',
};

// === CHAIN SLUG (for APIs like Moralis) ===
export const CHAIN_SLUGS: Record<number, string> = {
  [base.id]: 'base',
  [polygon.id]: 'polygon',
  [mainnet.id]: 'eth',
  [arbitrum.id]: 'arbitrum',
  [optimism.id]: 'optimism',
  [bsc.id]: 'bsc',
};

export const getChainSlug = (chainId: number): string => {
  return CHAIN_SLUGS[chainId] || 'base';
};

// === BLOCK EXPLORERS ===
export const BLOCK_EXPLORERS: Record<number, string> = {
  [base.id]: 'https://basescan.org',
  [polygon.id]: 'https://polygonscan.com',
  [mainnet.id]: 'https://etherscan.io',
  [arbitrum.id]: 'https://arbiscan.io',
  [optimism.id]: 'https://optimistic.etherscan.io',
  [bsc.id]: 'https://bscscan.com',
};

export const getBlockExplorer = (chainId: number): string => {
  return BLOCK_EXPLORERS[chainId] || BLOCK_EXPLORERS[DEFAULT_CHAIN_ID];
};
