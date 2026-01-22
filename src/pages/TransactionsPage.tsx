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
        {/* NFT icon with gradient background */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-purple-500/20">
          <span className="text-lg">🖼️</span>
        </div>
        
        {/* Chain badge overlay - bottom right */}
        <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5 shadow-sm">
          <ChainIcon chainId={chainId} size={14} />
        </div>
        
        {/* Direction arrow overlay - top left */}
        <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
          type === 'withdrawal' ? 'bg-destructive' : 'bg-green-500'
        }`}>
          {type === 'withdrawal' 
            ? <ArrowUpCircle className="h-3 w-3 text-white" />
            : <ArrowDownCircle className="h-3 w-3 text-white" />
          }
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative flex-shrink-0">
      {/* Main token icon */}
      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
        <TokenIcon 
          symbol={symbol}
          variant="branded"
          size={28}
          className="rounded-full"
        />
      </div>
      
      {/* Chain badge overlay - bottom right */}
      <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5 shadow-sm">
        <ChainIcon chainId={chainId} size={14} />
      </div>
      
      {/* Direction arrow overlay - top left */}
      <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
        type === 'withdrawal' ? 'bg-destructive' : 'bg-green-500'
      }`}>
        {type === 'withdrawal' 
          ? <ArrowUpCircle className="h-3 w-3 text-white" />
          : <ArrowDownCircle className="h-3 w-3 text-white" />
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
        
        <section className="px-6 pt-6 space-y-3">
          <ul className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <li key={i}>
                <article className="p-4 animate-pulse border-border/50 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted/70 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-muted/70 rounded-md w-32 animate-pulse" />
                        <div className="h-4 bg-muted/70 rounded-md w-20 animate-pulse" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-muted/50 rounded-md w-24 animate-pulse" />
                        <div className="h-6 bg-muted/50 rounded-full w-16 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </article>
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
        <Tabs value={filter} onValueChange={setFilter} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 h-10 bg-muted/40 rounded-full p-0.5">
            <TabsTrigger 
              value="all" 
              className="rounded-full text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="deposits"
              className="rounded-full text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              Deposits
            </TabsTrigger>
            <TabsTrigger 
              value="withdrawals"
              className="rounded-full text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              Withdrawals
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6 space-y-3">
            {error ? (
              <Card className="p-8 text-center border-destructive/20 bg-destructive/5">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold mb-2">Loading Error</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Unable to load transactions
                </p>
                <Button 
                  onClick={() => refetch()} 
                  variant="outline"
                  className="hover:bg-destructive/10 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </Card>
            ) : filteredTransactions.length === 0 ? (
              <div className="mx-4 mt-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                  {filter === 'deposits' && <ArrowDownCircle className="h-8 w-8 text-muted-foreground" />}
                  {filter === 'withdrawals' && <ArrowUpCircle className="h-8 w-8 text-muted-foreground" />}
                  {filter === 'all' && <TrendingUp className="h-8 w-8 text-muted-foreground" />}
                </div>
                <h3 className="text-[17px] font-semibold mb-2 text-foreground">No transactions</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  {filter === 'deposits' && 'No deposits found yet'}
                  {filter === 'withdrawals' && 'No withdrawals found yet'}
                  {filter === 'all' && 'No transactions found yet'}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <li key={transaction.hash}>
                    <article className="mx-4 mb-3 p-4 bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl hover:bg-card/70 hover:border-border/40 transition-all duration-200 active:scale-[0.98]">
                      <div className="flex items-center gap-3">
                        <TransactionIcon 
                          currency={transaction.currency}
                          type={transaction.type}
                          chainId={transaction.chainId}
                          tokenStandard={transaction.tokenStandard}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-[15px] text-foreground leading-tight">
                              {transaction.description || 
                               (transaction.type === 'withdrawal' ? 'Withdrawal' : 'Deposit')}
                            </h3>
                            <span className={`text-[15px] font-semibold ${
                              transaction.type === 'withdrawal' ? 'text-destructive' : 'text-green-600'
                            }`}>
                              {formatAmount(transaction.amount, transaction.type, transaction.currency)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[13px] text-muted-foreground">
                              {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(transaction.status)} transition-colors`}
                            >
                              <div className="flex items-center gap-1">
                                {getStatusIcon(transaction.status)}
                                {getStatusText(transaction.status)}
                              </div>
                            </Badge>
                          </div>
                          
                          {transaction.hash && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] text-muted-foreground font-mono bg-accent/20 px-2 py-1 rounded-md">
                                {transaction.hash.slice(0, 6)}...{transaction.hash.slice(-4)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full hover:bg-accent/30 transition-colors"
                                onClick={() => window.open(`${getBlockExplorer(chainId)}/tx/${transaction.hash}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          
                          {transaction.fee > 0 && (
                            <p className="text-[11px] text-muted-foreground">
                              Fee: {transaction.fee.toFixed(6)} {NATIVE_SYMBOLS[transaction.chainId] || 'ETH'}
                            </p>
                          )}
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
