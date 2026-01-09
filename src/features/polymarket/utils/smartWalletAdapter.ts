/**
 * Adapter to convert Privy SmartWalletClient (Viem) to an ethers v5/v6 compatible signer
 * Used for Polymarket clob-client which expects ethers signer interface
 */

import { logger } from '@/utils/logger';

interface SmartWalletClient {
  account: {
    address: string;
  };
  signTypedData: (params: {
    account: any;
    domain: any;
    types: any;
    primaryType: string;
    message: any;
  }) => Promise<string>;
  signMessage: (params: {
    account: any;
    message: string;
  }) => Promise<string>;
}

/**
 * Creates an ethers-compatible signer from a Privy Smart Wallet client
 * Supports both ethers v5 (_signTypedData) and v6 (signTypedData) interfaces
 */
export function createSignerFromSmartWallet(client: SmartWalletClient) {
  // Handle different address formats
  const address = typeof client.account.address === 'string' 
    ? client.account.address 
    : (client.account.address as any).address || client.account.address;

  logger.info('[SmartWalletAdapter] Creating signer for address:', address);
  
  const signTypedDataImpl = async (domain: any, types: any, value: any): Promise<string> => {
    // Remove EIP712Domain from types if present (Viem handles it automatically)
    const { EIP712Domain, ...typesWithoutDomain } = types;
    const primaryType = Object.keys(typesWithoutDomain)[0];
    
    logger.info('[SmartWalletAdapter] Signing typed data with primaryType:', primaryType);
    
    return await client.signTypedData({
      account: client.account,
      domain,
      types: typesWithoutDomain,
      primaryType,
      message: value,
    });
  };

  // signMessage for deriveApiKey/createApiKey
  const signMessageImpl = async (message: string | Uint8Array): Promise<string> => {
    logger.info('[SmartWalletAdapter] Signing message');
    
    const messageToSign = typeof message === 'string' 
      ? message 
      : new TextDecoder().decode(message);
    
    return await client.signMessage({
      account: client.account,
      message: messageToSign,
    });
  };

  return {
    // Required for ethers signer interface
    getAddress: async () => address,
    
    // ethers v5 interface (used by @polymarket/clob-client)
    _signTypedData: signTypedDataImpl,
    
    // ethers v6 interface
    signTypedData: signTypedDataImpl,
    
    // signMessage for API credential derivation
    signMessage: signMessageImpl,
    
    // Provider stub (some libraries check for this)
    provider: null,
  };
}
