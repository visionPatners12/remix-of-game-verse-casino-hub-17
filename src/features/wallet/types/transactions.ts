// ThirdWeb Transaction Types - v2
export interface ThirdWebTransaction {
  chain_id: string;
  block_number: number;
  block_hash: string;
  block_timestamp: number;
  hash: string;
  nonce: number;
  transaction_index: number;
  from_address: string;
  to_address: string;
  value: string;
  gas_price: string;
  gas: number;
  function_selector: string;
  data: string;
  max_fee_per_gas: string;
  max_priority_fee_per_gas: string;
  transaction_type: number;
  r: string;
  s: string;
  v: string;
  access_list_json: string;
  authorization_list_json: string;
  contract_address: string;
  gas_used: number;
  cumulative_gas_used: number;
  effective_gas_price: string;
  blob_gas_used: number;
  blob_gas_price: string;
  logs_bloom: string;
  status: number;
  decoded?: {
    name: string;
    signature: string;
    inputs: {
      recipient?: string;
      amount?: string;
      [key: string]: any;
    };
  } | null;
}

export interface ThirdWebTransactionsResponse {
  data: ThirdWebTransaction[];
  aggregations: any | null;
  meta: {
    chain_ids: number[];
    address: string;
    signature: string;
    page: number;
    limit_per_chain: number;
    total_items: number;
    total_pages: number;
  };
}

// Known ERC-20 tokens on Polygon
const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number; name: string }> = {
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': { symbol: 'USDT', decimals: 6, name: 'Tether USD' },
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { symbol: 'USDC', decimals: 6, name: 'USD Coin' },
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': { symbol: 'USDC', decimals: 6, name: 'USD Coin (Native)' },
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': { symbol: 'WETH', decimals: 18, name: 'Wrapped Ether' },
  '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': { symbol: 'WMATIC', decimals: 18, name: 'Wrapped Matic' },
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': { symbol: 'WBTC', decimals: 8, name: 'Wrapped Bitcoin' },
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': { symbol: 'DAI', decimals: 18, name: 'Dai Stablecoin' },
};

// ERC20 Transfer interface for incoming transfers endpoint
export interface ERC20Transfer {
  chain_id: string;
  block_number: number;
  block_timestamp: number;
  transaction_hash: string;
  from_address: string;
  to_address: string;
  token_address: string;
  value: string;
}

// Transform ERC20 transfer to our Transaction interface
export const transformERC20Transfer = (tx: ERC20Transfer, walletAddress: string): any => {
  try {
    const tokenAddressLower = tx.token_address?.toLowerCase() || '';
    const tokenInfo = KNOWN_TOKENS[tokenAddressLower];
    
    const isIncoming = tx.to_address?.toLowerCase() === walletAddress.toLowerCase();
    
    let amount: number;
    let currency: string;
    
    if (tokenInfo) {
      amount = parseFloat(tx.value || '0') / Math.pow(10, tokenInfo.decimals);
      currency = tokenInfo.symbol;
    } else {
      // Unknown token - assume 18 decimals
      amount = parseFloat(tx.value || '0') / Math.pow(10, 18);
      currency = 'TOKEN';
    }
    
    const shortFrom = tx.from_address ? `${tx.from_address.slice(0, 6)}...${tx.from_address.slice(-4)}` : 'Unknown';
    const shortTo = tx.to_address ? `${tx.to_address.slice(0, 6)}...${tx.to_address.slice(-4)}` : 'Unknown';
    
    const description = isIncoming 
      ? `Received ${currency} from ${shortFrom}`
      : `Sent ${currency} to ${shortTo}`;
    
    // Handle timestamp
    let createdAt: string;
    if (tx.block_timestamp) {
      const timestamp = tx.block_timestamp * 1000;
      const date = new Date(timestamp);
      if (date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
        createdAt = date.toISOString();
      } else {
        createdAt = new Date().toISOString();
      }
    } else {
      createdAt = new Date().toISOString();
    }
    
    return {
      id: tx.transaction_hash || `transfer-${tx.block_number}`,
      amount: amount,
      currency: currency,
      type: isIncoming ? 'deposit' : 'withdrawal',
      status: 'completed',
      description: description,
      created_at: createdAt,
      from_address: tx.from_address || '',
      to_address: tx.to_address || '',
      hash: tx.transaction_hash || '',
      network: 'Polygon',
      fee: 0, // ERC20 transfers endpoint doesn't include gas info
      confirmations: 1,
      user_id: walletAddress
    };
  } catch (error) {
    console.error('Error transforming ERC20 transfer:', error, tx);
    return {
      id: tx.transaction_hash || `error-${Date.now()}`,
      amount: 0,
      currency: 'TOKEN',
      type: 'deposit',
      status: 'failed',
      description: 'Transfer parsing error',
      created_at: new Date().toISOString(),
      from_address: tx.from_address || '',
      to_address: tx.to_address || '',
      hash: tx.transaction_hash || '',
      network: 'Polygon',
      fee: 0,
      confirmations: 0,
      user_id: walletAddress
    };
  }
};

// Transform ThirdWeb transaction to our Transaction interface
export const transformThirdWebTransaction = (tx: ThirdWebTransaction, walletAddress: string): any => {
  try {
    const isOutgoing = tx.from_address?.toLowerCase() === walletAddress.toLowerCase();
    const toAddress = tx.to_address?.toLowerCase() || '';
    
    // Check if this is an ERC-20 token transfer or approve
    const isTokenTransfer = tx.decoded?.name === 'transfer' && tx.decoded?.inputs?.amount;
    const isApprove = tx.decoded?.name === 'approve';
    const tokenInfo = KNOWN_TOKENS[toAddress];
    
    let amount: number;
    let currency: string;
    let description: string;
    
    if (isApprove) {
      // Token approval transaction
      amount = 0;
      currency = tokenInfo?.symbol || 'TOKEN';
      const spender = tx.decoded?.inputs?.spender || '';
      const shortSpender = spender ? `${spender.slice(0, 6)}...${spender.slice(-4)}` : 'Unknown';
      description = `Approved ${currency} for ${shortSpender}`;
    } else if (isTokenTransfer && tokenInfo) {
      // ERC-20 token transfer
      const rawAmount = tx.decoded?.inputs?.amount || '0';
      amount = parseFloat(rawAmount) / Math.pow(10, tokenInfo.decimals);
      currency = tokenInfo.symbol;
      
      const recipient = tx.decoded?.inputs?.recipient || '';
      const shortRecipient = recipient ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}` : 'Unknown';
      description = `Sent ${tokenInfo.symbol} to ${shortRecipient}`;
    } else if (isTokenTransfer) {
      // Unknown token transfer - try to parse anyway
      const rawAmount = tx.decoded?.inputs?.amount || '0';
      amount = parseFloat(rawAmount) / Math.pow(10, 6); // Default to 6 decimals
      currency = 'TOKEN';
      
      const recipient = tx.decoded?.inputs?.recipient || '';
      const shortRecipient = recipient ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}` : 'Unknown';
      description = `Token transfer to ${shortRecipient}`;
    } else {
      // Native MATIC transfer
      amount = tx.value ? parseFloat(tx.value) / Math.pow(10, 18) : 0;
      currency = 'MATIC';
      
      if (isOutgoing) {
        const shortTo = tx.to_address ? `${tx.to_address.slice(0, 6)}...${tx.to_address.slice(-4)}` : 'Unknown';
        description = `Sent to ${shortTo}`;
      } else {
        const shortFrom = tx.from_address ? `${tx.from_address.slice(0, 6)}...${tx.from_address.slice(-4)}` : 'Unknown';
        description = `Received from ${shortFrom}`;
      }
    }
    
    const gasUsed = tx.gas_price && tx.gas_used ? 
      (parseInt(tx.gas_price) * tx.gas_used) / Math.pow(10, 18) : 0;
    
    // Handle timestamp - ThirdWeb returns Unix timestamp in seconds
    let createdAt: string;
    if (tx.block_timestamp) {
      const timestamp = tx.block_timestamp * 1000;
      const date = new Date(timestamp);
      if (date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
        createdAt = date.toISOString();
      } else {
        createdAt = new Date().toISOString();
      }
    } else {
      createdAt = new Date().toISOString();
    }
    
    return {
      id: tx.hash || `tx-${tx.block_number}-${tx.transaction_index}`,
      amount: amount,
      currency: currency,
      type: isOutgoing ? 'withdrawal' : 'deposit',
      status: tx.status === 1 ? 'completed' : tx.status === 0 ? 'failed' : 'pending',
      description: description,
      created_at: createdAt,
      from_address: tx.from_address || '',
      to_address: tx.to_address || '',
      hash: tx.hash || '',
      network: 'Polygon',
      fee: gasUsed,
      confirmations: 1,
      user_id: walletAddress
    };
  } catch (error) {
    console.error('Error transforming transaction:', error, tx);
    return {
      id: tx.hash || `error-${Date.now()}`,
      amount: 0,
      currency: 'MATIC',
      type: 'deposit',
      status: 'failed',
      description: 'Transaction parsing error',
      created_at: new Date().toISOString(),
      from_address: tx.from_address || '',
      to_address: tx.to_address || '',
      hash: tx.hash || '',
      network: 'Polygon',
      fee: 0,
      confirmations: 0,
      user_id: walletAddress
    };
  }
};
