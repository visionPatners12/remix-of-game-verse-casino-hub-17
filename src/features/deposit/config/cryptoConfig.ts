// Crypto configuration for deposit/withdrawal

export interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  network: string;
  decimals: number;
  address: string;
  contractAddress?: string;
  logoUrl: string;
}

export const cryptoOptions: CryptoOption[] = [
  {
    id: 'usdt-polygon',
    name: 'USDT',
    symbol: 'USDT', 
    network: 'Polygon',
    decimals: 6,
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    logoUrl: '/images/crypto/usdt.png'
  },
  {
    id: 'usdc-polygon',
    name: 'USDC',
    symbol: 'USDC',
    network: 'Polygon',
    decimals: 6,
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    logoUrl: '/images/crypto/usdc.png'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin',
    decimals: 8,
    address: '', // Bitcoin doesn't have a contract address
    logoUrl: '/images/crypto/bitcoin.png'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'Ethereum',
    decimals: 18,
    address: '', // ETH doesn't have a contract address
    logoUrl: '/images/crypto/ethereum.png'
  }
];