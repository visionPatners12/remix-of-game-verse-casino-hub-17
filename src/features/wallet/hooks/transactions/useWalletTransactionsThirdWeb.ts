import { useQuery } from '@tanstack/react-query';
import { useUnifiedWallet } from '../core/useUnifiedWallet';
import { ThirdWebTransactionsResponse, transformThirdWebTransaction, transformERC20Transfer } from '../../types/transactions';

const CLIENT_ID = "7664bfb40927b7688babc12152f89138";
const THIRDWEB_API_URL = 'https://137.insight.thirdweb.com/v1/wallets';
const ERC20_TRANSFERS_URL = 'https://137.insight.thirdweb.com/v1/tokens/erc20/transfers';

interface ERC20Transfer {
  chain_id: string;
  block_number: number;
  block_timestamp: number;
  transaction_hash: string;
  from_address: string;
  to_address: string;
  token_address: string;
  value: string;
  decoded?: {
    name: string;
    signature: string;
    inputs: Record<string, string>;
  };
}

interface ERC20TransfersResponse {
  data: ERC20Transfer[];
  meta: {
    page: number;
    total_items: number;
    total_pages: number;
  };
}

export const useWalletTransactionsThirdWeb = () => {
  const { address, isConnected } = useUnifiedWallet();

  const fetchTransactions = async (): Promise<any[]> => {
    if (!address || !isConnected) {
      return [];
    }

    const walletAddressLower = address.toLowerCase();

    try {
      // Fetch both outgoing transactions AND incoming token transfers in parallel
      const [txResponse, incomingTransfersResponse] = await Promise.all([
        // Outgoing transactions (from this wallet)
        fetch(`${THIRDWEB_API_URL}/${address}/transactions?limit=50&page=1`, {
          headers: {
            'x-client-id': CLIENT_ID,
            'Accept': 'application/json',
          }
        }),
        // Incoming ERC20 transfers (to this wallet)
        fetch(`${ERC20_TRANSFERS_URL}?to_address=${address}&limit=50`, {
          headers: {
            'x-client-id': CLIENT_ID,
            'Accept': 'application/json',
          }
        })
      ]);
      
      // Process outgoing transactions
      let outgoingTxs: any[] = [];
      if (txResponse.ok) {
        const txData: ThirdWebTransactionsResponse = await txResponse.json();
        console.log('ThirdWeb Outgoing TX Response:', {
          dataCount: txData.data?.length || 0,
          meta: txData.meta
        });
        
        if (txData.data && Array.isArray(txData.data)) {
          outgoingTxs = txData.data
            .filter(tx => tx && tx.hash)
            .map(tx => transformThirdWebTransaction(tx, walletAddressLower));
        }
      } else {
        console.error(`ThirdWeb TX API Error: ${txResponse.status}`);
      }

      // Process incoming ERC20 transfers
      let incomingTransfers: any[] = [];
      if (incomingTransfersResponse.ok) {
        const transfersData: ERC20TransfersResponse = await incomingTransfersResponse.json();
        console.log('ThirdWeb Incoming Transfers Response:', {
          dataCount: transfersData.data?.length || 0,
          meta: transfersData.meta
        });
        
        if (transfersData.data && Array.isArray(transfersData.data)) {
          incomingTransfers = transfersData.data
            .filter(tx => tx && tx.transaction_hash)
            // Filter out transfers that are already in outgoing (to avoid duplicates)
            .filter(tx => !outgoingTxs.some(outTx => outTx.hash === tx.transaction_hash))
            .map(tx => transformERC20Transfer(tx, walletAddressLower));
        }
      } else {
        console.error(`ThirdWeb Transfers API Error: ${incomingTransfersResponse.status}`);
      }

      // Merge and sort by date (newest first)
      const allTransactions = [...outgoingTxs, ...incomingTransfers]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('Combined transactions:', {
        outgoing: outgoingTxs.length,
        incoming: incomingTransfers.length,
        total: allTransactions.length
      });

      return allTransactions;
    } catch (error) {
      console.error('Error fetching transactions from ThirdWeb:', {
        error: error instanceof Error ? error.message : error,
        address
      });
      throw error;
    }
  };

  return useQuery({
    queryKey: ['wallet-transactions-thirdweb', address],
    queryFn: fetchTransactions,
    enabled: !!address && isConnected,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};