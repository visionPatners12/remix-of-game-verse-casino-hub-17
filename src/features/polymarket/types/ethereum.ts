/**
 * Ethereum provider types for wallet integration
 * Note: We use a custom EthereumProvider type since window.ethereum
 * may already be declared elsewhere with a different type
 */
import type { Eip1193Provider } from 'ethers';

export type EthereumProvider = Eip1193Provider;

/**
 * @deprecated Use privyWallet.getEthereumProvider() instead.
 * This function does NOT work with Privy embedded wallets (email users).
 */
export function getEthereumProvider(): Eip1193Provider | undefined {
  console.warn('[DEPRECATED] getEthereumProvider() is deprecated. Use Privy wallet provider instead.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).ethereum as Eip1193Provider | undefined;
}
