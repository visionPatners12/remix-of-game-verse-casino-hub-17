import { useMemo } from 'react';
import { cryptoOptions } from '@/features/deposit/config/cryptoConfig';

interface TokenIconConfig {
  symbol?: string;
  network?: string;
  address?: string;
  fallbackSymbol?: string;
}

export function useTokenIcon(config: TokenIconConfig) {
  return useMemo(() => {
    const { symbol, network, address, fallbackSymbol } = config;
    
    // Try to find exact match in crypto config
    const cryptoMatch = cryptoOptions.find(crypto => 
      crypto.symbol.toLowerCase() === symbol?.toLowerCase() ||
      crypto.contractAddress?.toLowerCase() === address?.toLowerCase()
    );
    
    if (cryptoMatch) {
      return {
        symbol: cryptoMatch.symbol.toLowerCase(),
        network: cryptoMatch.network.toLowerCase(),
        address: cryptoMatch.contractAddress || cryptoMatch.address,
        hasMatch: true
      };
    }
    
    // Network-specific mappings for common tokens
    const networkMappings: Record<string, Record<string, string>> = {
      ethereum: {
        usdt: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        usdc: '0xa0b86a33e6c4ea3a0d90c8128b6e5f035867ae75',
        eth: 'native'
      },
      polygon: {
        usdt: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        usdc: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        matic: 'native'
      },
      bsc: {
        usdt: '0x55d398326f99059ff775485246999027b3197955',
        usdc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        bnb: 'native'
      }
    };
    
    const normalizedNetwork = network?.toLowerCase() || 'ethereum';
    const normalizedSymbol = (symbol || fallbackSymbol || 'unknown').toLowerCase();
    
    const mappedAddress = networkMappings[normalizedNetwork]?.[normalizedSymbol];
    
    return {
      symbol: normalizedSymbol,
      network: normalizedNetwork,
      address: mappedAddress || address,
      hasMatch: !!mappedAddress
    };
  }, [config.symbol, config.network, config.address, config.fallbackSymbol]);
}