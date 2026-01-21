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
  fee: number;
}

// Known token addresses on Base
const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { symbol: 'USDC', decimals: 6 },
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { symbol: 'DAI', decimals: 18 },
  '0x4200000000000000000000000000000000000006': { symbol: 'WETH', decimals: 18 },
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
  if (networkId.includes('polygon')) return 'MATIC';
  if (networkId.includes('ethereum')) return 'ETH';
  return 'ETH';
}

export function transformCDPTransaction(
  tx: CDPTransaction,
  walletAddress: string
): TransformedCDPTransaction {
  const walletLower = walletAddress.toLowerCase();
  const fromLower = tx.content_from?.toLowerCase() || '';
  const toLower = tx.content_to?.toLowerCase() || '';
  
  const isOutgoing = fromLower === walletLower;
  const isIncoming = toLower === walletLower;
  
  // Parse value (stored as number in wei)
  const valueWei = BigInt(tx.value || 0);
  const amount = Number(valueWei) / 1e18;
  
  // Determine currency based on network
  const currency = getNetworkCurrency(tx.network_id);
  
  // Calculate fee if gas info available
  let fee = 0;
  if (tx.gas && tx.gas_price) {
    fee = (tx.gas * tx.gas_price) / 1e18;
  }
  
  // Determine type
  let type: 'deposit' | 'withdrawal' = 'deposit';
  if (isOutgoing) {
    type = 'withdrawal';
  } else if (isIncoming) {
    type = 'deposit';
  }
  
  // Build description
  let description = '';
  if (type === 'withdrawal') {
    description = `Sent to ${formatAddress(tx.content_to)}`;
  } else {
    description = `Received from ${formatAddress(tx.content_from)}`;
  }
  
  // Handle zero-value transactions (contract interactions)
  if (amount === 0 && tx.content) {
    description = 'Contract interaction';
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
    to_address: tx.content_to,
    network: tx.network_id,
    fee,
  };
}
