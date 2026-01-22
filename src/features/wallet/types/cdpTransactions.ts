// CDP Address Transactions Types and Transformations

export interface CDPTransaction {
  id: string;
  user_id: string;
  network_id: string;
  from_address_id: string | null;
  status: string | null;
  transaction_hash: string;
  transaction_link: string | null;
  unsigned_payload: string | null;
  signed_payload: string | null;
  content_from: string | null;
  content_to: string | null;
  gas: number | null;
  gas_price: number | null;
  nonce: number | null;
  value: number | null;
  tx_type: number | null;
  max_fee_per_gas: number | null;
  max_priority_fee_per_gas: number | null;
  priority_fee_per_gas: number | null;
  block_timestamp: string | null;
  mint: string | null;
  content: Record<string, unknown> | null;
  raw: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // ERC20 token fields
  token_contract_address: string | null;
  token_amount_raw: number | null;
  token_standard: string | null;
  token_method: string | null;
  token_recipient: string | null;
}

export interface TransformedCDPTransaction {
  id: string;
  hash: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  created_at: string;
  from_address: string | null;
  to_address: string | null;
  network: string;
  chainId: number;
  tokenContractAddress: string | null;
  tokenStandard: 'native' | 'erc20' | 'erc1155' | null;
  fee: number;
}

// Known token addresses across chains (lowercase)
const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  // Base
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { symbol: 'USDC', decimals: 6 },
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { symbol: 'DAI', decimals: 18 },
  '0x4200000000000000000000000000000000000006': { symbol: 'WETH', decimals: 18 },
  // Polygon
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': { symbol: 'USDC', decimals: 6 },
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { symbol: 'USDC.e', decimals: 6 },
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': { symbol: 'USDT', decimals: 6 },
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': { symbol: 'WETH', decimals: 18 },
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': { symbol: 'DAI', decimals: 18 },
  // Ethereum
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { symbol: 'USDC', decimals: 6 },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { symbol: 'USDT', decimals: 6 },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { symbol: 'DAI', decimals: 18 },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { symbol: 'WETH', decimals: 18 },
  // Arbitrum
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831': { symbol: 'USDC', decimals: 6 },
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': { symbol: 'USDC.e', decimals: 6 },
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': { symbol: 'USDT', decimals: 6 },
  // Optimism
  '0x0b2c639c533813f4aa9d7837caf62653d097ff85': { symbol: 'USDC', decimals: 6 },
  '0x7f5c764cbc14f9669b88837ca1490cca17c31607': { symbol: 'USDC.e', decimals: 6 },
  '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': { symbol: 'USDT', decimals: 6 },
};

function formatAddress(address: string | null): string {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function parseStatus(status: string | null): 'completed' | 'pending' | 'failed' {
  if (!status) return 'pending';
  const s = status.toLowerCase();
  if (s === 'complete' || s === 'completed' || s === 'success') return 'completed';
  if (s === 'failed' || s === 'error' || s === 'rejected') return 'failed';
  return 'pending';
}

function getNetworkCurrency(networkId: string): string {
  if (networkId.includes('base')) return 'ETH';
  if (networkId.includes('polygon')) return 'POL';
  if (networkId.includes('ethereum')) return 'ETH';
  if (networkId.includes('arbitrum')) return 'ETH';
  if (networkId.includes('optimism')) return 'ETH';
  return 'ETH';
}

// CDP Network ID to Chain ID mapping
const CDP_NETWORK_TO_CHAIN_ID: Record<string, number> = {
  'base-mainnet': 8453,
  'base-sepolia': 84532,
  'polygon-mainnet': 137,
  'ethereum-mainnet': 1,
  'arbitrum-mainnet': 42161,
  'optimism-mainnet': 10,
};

function getChainIdFromNetwork(networkId: string): number {
  return CDP_NETWORK_TO_CHAIN_ID[networkId] || 8453;
}

export function transformCDPTransaction(
  tx: CDPTransaction,
  walletAddress: string
): TransformedCDPTransaction {
  const walletLower = walletAddress.toLowerCase();
  
  // Detect token standard and transfer type
  const isERC1155 = tx.token_standard === 'erc1155';
  const hasTokenTransfer = tx.token_contract_address !== null && 
                           tx.token_amount_raw !== null && 
                           Number(tx.token_amount_raw) > 0;
  const hasNativeTransfer = tx.value !== null && Number(tx.value) > 0;
  
  let amount = 0;
  let currency = getNetworkCurrency(tx.network_id);
  let toAddress = tx.content_to;
  let tokenStandard: 'native' | 'erc20' | 'erc1155' | null = null;
  
  if (isERC1155) {
    // NFT transfer
    tokenStandard = 'erc1155';
    currency = 'NFT';
    amount = Number(tx.token_amount_raw || 1);
    toAddress = tx.token_recipient || tx.content_to;
  } else if (hasTokenTransfer) {
    // ERC20 token transfer
    tokenStandard = 'erc20';
    const tokenAddress = tx.token_contract_address!.toLowerCase();
    const tokenInfo = KNOWN_TOKENS[tokenAddress];
    
    // Handle unknown tokens with heuristics
    let decimals = 18;
    if (tokenInfo) {
      decimals = tokenInfo.decimals;
      currency = tokenInfo.symbol;
    } else {
      // Heuristic: if raw amount is very large (>1e15), likely 18 decimals
      // if smaller (<1e10), likely 6 decimals (stablecoins)
      const rawAmount = Number(tx.token_amount_raw);
      decimals = rawAmount > 1e15 ? 18 : rawAmount > 1e10 ? 8 : 6;
      currency = 'TOKEN';
      console.log(`[Transform] Unknown token ${tokenAddress}, using ${decimals} decimals`);
    }
    
    try {
      amount = Number(tx.token_amount_raw) / Math.pow(10, decimals);
    } catch {
      amount = 0;
    }
    
    toAddress = tx.token_recipient || tx.content_to;
  } else if (hasNativeTransfer) {
    // Native ETH/MATIC/POL transaction
    tokenStandard = 'native';
    try {
      amount = Number(tx.value) / 1e18;
    } catch {
      amount = 0;
    }
  } else {
    // Contract interaction without value transfer
    tokenStandard = null;
  }
  
  // Determine type based on addresses
  const fromLower = tx.content_from?.toLowerCase() || '';
  const effectiveToLower = (hasTokenTransfer ? tx.token_recipient : tx.content_to)?.toLowerCase() || '';
  
  const isOutgoing = fromLower === walletLower;
  const isIncoming = effectiveToLower === walletLower;
  
  let type: 'deposit' | 'withdrawal' = 'deposit';
  if (isOutgoing && !isIncoming) {
    type = 'withdrawal';
  } else if (isIncoming) {
    type = 'deposit';
  }
  
  // Build description based on what we detected
  let description = '';
  if (isERC1155) {
    description = type === 'withdrawal' 
      ? `Sent NFT to ${formatAddress(toAddress)}`
      : `Received NFT from ${formatAddress(tx.content_from)}`;
  } else if (tokenStandard === 'erc20' && amount > 0) {
    description = type === 'withdrawal'
      ? `Sent ${currency} to ${formatAddress(toAddress)}`
      : `Received ${currency} from ${formatAddress(tx.content_from)}`;
  } else if (tokenStandard === 'native' && amount > 0) {
    description = type === 'withdrawal'
      ? `Sent ${currency} to ${formatAddress(toAddress)}`
      : `Received ${currency} from ${formatAddress(tx.content_from)}`;
  } else if (tx.token_contract_address) {
    // Contract interaction (approve, etc.)
    description = tx.token_method ? `${tx.token_method}` : 'Contract approval';
  } else {
    description = 'Contract call';
  }
  
  // Calculate fee
  let fee = 0;
  if (tx.gas && tx.gas_price) {
    fee = (Number(tx.gas) * Number(tx.gas_price)) / 1e18;
  }

  return {
    id: tx.id,
    hash: tx.transaction_hash,
    amount,
    currency,
    type,
    status: parseStatus(tx.status),
    description,
    created_at: tx.block_timestamp || tx.created_at,
    from_address: tx.content_from,
    to_address: toAddress,
    network: tx.network_id,
    chainId: getChainIdFromNetwork(tx.network_id),
    tokenContractAddress: tx.token_contract_address,
    tokenStandard,
    fee,
  };
}
