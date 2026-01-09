// Hook to fetch Polymarket CLOB order book with live prices

import { useQuery } from '@tanstack/react-query';

export interface OrderBookEntry {
  price: string;
  size: string;
}

export interface OrderBookResponse {
  market: string;
  asset_id: string;
  timestamp: string;
  hash: string;
  bids: OrderBookEntry[];  // Sorted ascending (best bid = last)
  asks: OrderBookEntry[];  // Sorted descending (best ask = last)
  min_order_size: string;
  tick_size: string;
  neg_risk: boolean;
}

export interface OrderBookPrices {
  bestBid: number | null;
  bestAsk: number | null;
  spread: number | null;
  minOrderSize: number;
  tickSize: number;
  maxBuyAmount: number;
  minBuyAmount: number;
  totalAskLiquidity: number;
  totalBidLiquidity: number;
}

export interface MarketOrderSimulation {
  shares: number;
  avgPrice: number;
  levels: number;
  hasSlippage: boolean;
  costUsed: number;
}

async function fetchOrderBook(tokenId: string): Promise<OrderBookResponse> {
  const response = await fetch(
    `https://clob.polymarket.com/book?token_id=${tokenId}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch order book: ${response.status}`);
  }
  return response.json();
}

export function useOrderBook(tokenId: string | undefined) {
  return useQuery({
    queryKey: ['polymarket-orderbook', tokenId],
    queryFn: () => fetchOrderBook(tokenId!),
    enabled: !!tokenId,
    refetchInterval: 3000, // Refresh every 3 seconds for live prices
    staleTime: 1000,
    retry: 2,
  });
}

// Simulate a market order traversing the order book
// Returns realistic shares, average price, and slippage info
export function simulateMarketOrder(
  asks: OrderBookEntry[], 
  amountUSDC: number
): MarketOrderSimulation {
  if (amountUSDC <= 0 || asks.length === 0) {
    return { shares: 0, avgPrice: 0, levels: 0, hasSlippage: false, costUsed: 0 };
  }

  // Asks are sorted descending in API response, so reverse to get ascending (cheapest first)
  const sortedAsks = [...asks].reverse();
  
  let remainingAmount = amountUSDC;
  let totalShares = 0;
  let levelsUsed = 0;
  
  for (const ask of sortedAsks) {
    if (remainingAmount <= 0) break;
    
    const price = parseFloat(ask.price);
    const availableShares = parseFloat(ask.size);
    const maxCostAtLevel = availableShares * price;
    
    if (remainingAmount >= maxCostAtLevel) {
      // Consume entire level
      totalShares += availableShares;
      remainingAmount -= maxCostAtLevel;
    } else {
      // Partially consume this level
      const sharesBought = remainingAmount / price;
      totalShares += sharesBought;
      remainingAmount = 0;
    }
    levelsUsed++;
  }
  
  const costUsed = amountUSDC - remainingAmount;
  const avgPrice = totalShares > 0 ? costUsed / totalShares : 0;
  
  return { 
    shares: totalShares, 
    avgPrice, 
    levels: levelsUsed,
    hasSlippage: levelsUsed > 1,
    costUsed
  };
}

// Helper to extract best prices from order book
// Bids are sorted ascending (best bid = last element, highest price)
// Asks are sorted descending (best ask = last element, lowest price)
export function extractBestPrices(orderBook: OrderBookResponse): OrderBookPrices {
  // Best bid = last element of bids (highest buy price)
  const bestBid = orderBook.bids.length > 0 
    ? parseFloat(orderBook.bids[orderBook.bids.length - 1].price) 
    : null;
  
  // Best ask = last element of asks (lowest sell price)
  const bestAsk = orderBook.asks.length > 0 
    ? parseFloat(orderBook.asks[orderBook.asks.length - 1].price) 
    : null;

  // Calculate total liquidity available
  const totalAskLiquidity = orderBook.asks.reduce((sum, a) => 
    sum + parseFloat(a.size) * parseFloat(a.price), 0
  );
  
  const totalBidLiquidity = orderBook.bids.reduce((sum, b) => 
    sum + parseFloat(b.size) * parseFloat(b.price), 0
  );

  const minOrderSize = parseFloat(orderBook.min_order_size);
  const tickSize = parseFloat(orderBook.tick_size);

  return {
    bestBid,
    bestAsk,
    spread: bestAsk !== null && bestBid !== null ? bestAsk - bestBid : null,
    minOrderSize,
    tickSize,
    maxBuyAmount: totalAskLiquidity, // Max $ you can spend based on available asks
    minBuyAmount: minOrderSize * (bestAsk || 0), // Min $ based on min_order_size
    totalAskLiquidity,
    totalBidLiquidity,
  };
}
