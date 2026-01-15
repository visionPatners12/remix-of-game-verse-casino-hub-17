// LI.FI SDK Configuration
import { polygon, mainnet, arbitrum, optimism, base } from 'viem/chains';

// Supported chains for swapping
export const SUPPORTED_CHAINS = [polygon, mainnet, arbitrum, optimism, base];

// Chain IDs we support
export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(c => c.id);

// Default chain is Base (where PRYZEN operates)
export const DEFAULT_CHAIN_ID = base.id;

// Note: SDK is configured in useLifiConfig hook with EVM provider

// Format chain name for display
export const getChainName = (chainId: number): string => {
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
};

// Get chain by ID
export const getChain = (chainId: number) => {
  return SUPPORTED_CHAINS.find(c => c.id === chainId);
};

// Chain icons mapping (using chain slugs)
export const CHAIN_ICONS: Record<number, string> = {
  [polygon.id]: 'polygon',
  [mainnet.id]: 'ethereum',
  [arbitrum.id]: 'arbitrum',
  [optimism.id]: 'optimism',
  [base.id]: 'base',
};
