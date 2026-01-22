import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { TokenIcon } from '@web3icons/react/dynamic';
import { ChainIcon } from '@/components/ui/chain-icon';
import { useWalletTransactionsCDP } from '@/features/wallet/hooks/transactions/useWalletTransactionsCDP';
import { SUPPORTED_CHAINS, DEFAULT_CHAIN_ID, getBlockExplorer, NATIVE_SYMBOLS } from '@/config/chains';

// Transaction icon component with token + chain overlay
const TransactionIcon = ({ 
  currency, 
  type, 
  chainId,
  tokenStandard
}: { 
  currency: string; 
  type: 'deposit' | 'withdrawal';
  chainId: number;
  tokenStandard?: 'native' | 'erc20' | 'erc1155' | null;
}) => {
  // Normalize symbol for TokenIcon (remove .e suffix)
  const symbol = currency.replace('.e', '').toUpperCase();
  
  // NFT specific rendering
  if (tokenStandard === 'erc1155') {
    return (
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-purple-500/20">
          <span className="text-base">🖼️</span>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
          <ChainIcon chainId={chainId} size={12} />
        </div>
        <div className={`absolute -top-0.5 -left-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
          type === 'withdrawal' ? 'bg-destructive' : 'bg-green-500'
        }`}>
          {type === 'withdrawal' 
            ? <ArrowUpCircle className="h-2.5 w-2.5 text-white" />
            : <ArrowDownCircle className="h-2.5 w-2.5 text-white" />
          }
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative flex-shrink-0">
      <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
        <TokenIcon 
          symbol={symbol}
          variant="branded"
          size={24}
          className="rounded-full"
        />
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
        <ChainIcon chainId={chainId} size={12} />
      </div>
      <div className={`absolute -top-0.5 -left-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
        type === 'withdrawal' ? 'bg-destructive' : 'bg-green-500'
      }`}>
        {type === 'withdrawal' 
          ? <ArrowUpCircle className="h-2.5 w-2.5 text-white" />
          : <ArrowDownCircle className="h-2.5 w-2.5 text-white" />
        }
      </div>
    </div>
  );
};

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  
  const { 
    data: transactions = [], 
    isLoading, 
    error, 
    refetch,
    sync,
    isSyncing,
    chainId,
    setChainId 
  } = useWalletTransactionsCDP(DEFAULT_CHAIN_ID);

  // Sync on mount and chain change
  useEffect(() => {
    sync();
  }, [chainId]);

  const getTypeIcon = (type: string) => {
    if (type === 'withdrawal') {
      return <ArrowUpCircle className="h-5 w-5 text-red-400" />;
    }
    return <ArrowDownCircle className="h-5 w-5 text-green-400" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const formatAmount = (amount: number, type: string, currency: string) => {
    const sign = type === 'withdrawal' ? '-' : '+';
    
    // Stablecoins → display as dollar amount
    if (['USDC', 'USDC.e', 'USDT', 'DAI'].includes(currency)) {
      return `${sign}$${Math.abs(amount).toFixed(2)}`;
    }
    
    // Handle zero amounts
    if (amount === 0) return '0';
    
    // Native crypto → more decimals for small amounts
    const absAmount = Math.abs(amount);
    const decimals = absAmount < 0.01 ? 6 : absAmount < 1 ? 4 : 2;
    return `${sign}${absAmount.toFixed(decimals)} ${currency}`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'deposits') return transaction.type !== 'withdrawal';
    if (filter === 'withdrawals') return transaction.type === 'withdrawal';
    return true;
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <header className="sticky top-0 z-20 bg-gradient-to-r from-background via-background/98 to-background/95 backdrop-blur-md border-b border-border/50">
          <nav className="flex items-center justify-between px-6 py-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/wallet', { replace: true })} className="hover:bg-primary/10 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold tracking-tight">Transactions</h1>
            <div className="w-10" />
          </nav>
        </header>
        
        <section className="px-4 pt-4">
          <ul className="bg-card/30 rounded-xl overflow-hidden divide-y divide-border/30">
            {[...Array(6)].map((_, i) => (
              <li key={i} className="px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-muted/50 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-muted/50 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-muted/40 rounded w-1/3 animate-pulse" />
                  </div>
                  <div className="h-4 bg-muted/50 rounded w-16 animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/30 shadow-sm">
        <nav className="flex items-center justify-between px-4 py-3 h-14">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/wallet', { replace: true })}
            className="h-9 w-9 p-0 rounded-full hover:bg-accent/50 transition-all duration-150 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          
          <Select value={chainId.toString()} onValueChange={(v) => setChainId(Number(v))}>
            <SelectTrigger className="w-[130px] h-9 bg-muted/40 border-border/30 rounded-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <ChainIcon chainId={chainId} size={16} />
                  <span className="text-sm font-medium">
                    {SUPPORTED_CHAINS.find(c => c.id === chainId)?.name || 'Base'}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CHAINS.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  <div className="flex items-center gap-2">
                    <ChainIcon chainId={chain.id} size={16} />
                    {chain.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => sync()}
            disabled={isSyncing}
            className="h-9 w-9 p-0 rounded-full hover:bg-accent/50 transition-all duration-150 active:scale-95"
          >
            <RefreshCw className={`h-5 w-5 text-foreground transition-transform duration-200 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        </nav>
      </header>

      <section className="pb-20">
        <Tabs value={filter} onValueChange={setFilter} className="px-4 mt-4">
          <TabsList className="grid w-full grid-cols-3 h-9 bg-muted/40 rounded-full p-0.5">
            <TabsTrigger 
              value="all" 
              className="rounded-full text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="deposits"
              className="rounded-full text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Deposits
            </TabsTrigger>
            <TabsTrigger 
              value="withdrawals"
              className="rounded-full text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Withdrawals
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            {error ? (
              <Card className="mx-0 p-6 text-center border-destructive/20 bg-destructive/5">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-1">Loading Error</h3>
                <p className="text-sm text-muted-foreground mb-4">Unable to load transactions</p>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </Card>
            ) : filteredTransactions.length === 0 ? (
              <div className="mt-16 text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-accent/20 rounded-full flex items-center justify-center">
                  {filter === 'deposits' && <ArrowDownCircle className="h-7 w-7 text-muted-foreground" />}
                  {filter === 'withdrawals' && <ArrowUpCircle className="h-7 w-7 text-muted-foreground" />}
                  {filter === 'all' && <TrendingUp className="h-7 w-7 text-muted-foreground" />}
                </div>
                <h3 className="text-base font-semibold mb-1 text-foreground">No transactions</h3>
                <p className="text-sm text-muted-foreground">
                  {filter === 'deposits' && 'No deposits found yet'}
                  {filter === 'withdrawals' && 'No withdrawals found yet'}
                  {filter === 'all' && 'No transactions found yet'}
                </p>
              </div>
            ) : (
              <ul className="bg-card/30 rounded-xl overflow-hidden divide-y divide-border/30">
                {filteredTransactions.map((transaction) => (
                  <li key={transaction.hash}>
                    <article 
                      className="px-3 py-2.5 hover:bg-accent/30 active:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => window.open(`${getBlockExplorer(chainId)}/tx/${transaction.hash}`, '_blank')}
                    >
                      <div className="flex items-center gap-3">
                        <TransactionIcon 
                          currency={transaction.currency}
                          type={transaction.type}
                          chainId={transaction.chainId}
                          tokenStandard={transaction.tokenStandard}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-foreground truncate pr-2">
                              {transaction.description || 
                               (transaction.type === 'withdrawal' ? 'Sent' : 'Received')}
                            </h3>
                            <span className={`text-sm font-semibold shrink-0 ${
                              transaction.type === 'withdrawal' ? 'text-destructive' : 'text-green-600'
                            }`}>
                              {formatAmount(transaction.amount, transaction.type, transaction.currency)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                            </span>
                            <span className={`text-xs flex items-center gap-1 ${
                              transaction.status === 'completed' ? 'text-green-500' :
                              transaction.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {getStatusIcon(transaction.status)}
                              {getStatusText(transaction.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default TransactionsPage;
