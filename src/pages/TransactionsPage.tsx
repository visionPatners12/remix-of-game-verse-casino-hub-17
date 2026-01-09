import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useWalletTransactionsThirdWeb } from '@/features/wallet/hooks/transactions/useWalletTransactionsThirdWeb';

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  
  const { data: transactions = [], isLoading, error, refetch } = useWalletTransactionsThirdWeb();

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
    if (currency === 'USDT' || currency === 'USDC') {
      return `${sign}$${Math.abs(amount).toFixed(2)}`;
    }
    return `${sign}${Math.abs(amount).toFixed(4)} ${currency}`;
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
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:bg-primary/10 transition-colors">
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
            onClick={() => navigate(-1)}
            className="h-9 w-9 p-0 rounded-full hover:bg-accent/50 transition-all duration-150 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <h1 className="text-[17px] font-semibold text-foreground">Transactions</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-9 w-9 p-0 rounded-full hover:bg-accent/50 transition-all duration-150 active:scale-95"
          >
            <RefreshCw className={`h-5 w-5 text-foreground transition-transform duration-200 ${isLoading ? 'animate-spin' : ''}`} />
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
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          {getTypeIcon(transaction.type)}
                        </div>
                        
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
                                onClick={() => window.open(`https://polygonscan.com/tx/${transaction.hash}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          
                          {transaction.fee > 0 && (
                            <p className="text-[11px] text-muted-foreground">
                              Fee: {transaction.fee.toFixed(6)} MATIC
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
