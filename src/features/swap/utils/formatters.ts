// Swap utility functions

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: string, decimals: number, displayDecimals = 4): string {
  const value = Number(amount) / 10 ** decimals;
  if (value === 0) return '0';
  if (value < 0.0001) return '<0.0001';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

/**
 * Format USD value for display
 */
export function formatUSD(value: string | number): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num) || num === 0) return '$0.00';
  if (num < 0.01) return '<$0.01';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format time in seconds to human readable string
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `~${mins} min`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `~${hours}h ${mins}m`;
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(chainId: number, txHash: string): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io/tx/',
    137: 'https://polygonscan.com/tx/',
    42161: 'https://arbiscan.io/tx/',
    10: 'https://optimistic.etherscan.io/tx/',
    8453: 'https://basescan.org/tx/',
  };
  const base = explorers[chainId] || 'https://etherscan.io/tx/';
  return `${base}${txHash}`;
}

/**
 * Parse user input amount to BigInt wei
 */
export function parseAmount(input: string, decimals: number): bigint {
  if (!input || isNaN(Number(input))) return 0n;
  const value = Number(input);
  return BigInt(Math.floor(value * 10 ** decimals));
}

/**
 * Calculate price impact class for styling
 */
export function getPriceImpactClass(impact: string | number): string {
  const num = typeof impact === 'string' ? Number(impact) : impact;
  if (num < 1) return 'text-success';
  if (num < 3) return 'text-warning';
  return 'text-destructive';
}
