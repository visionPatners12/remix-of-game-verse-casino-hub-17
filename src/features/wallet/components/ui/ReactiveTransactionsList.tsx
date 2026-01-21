import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, History, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useWalletTransactionsCDP } from '../../hooks/transactions/useWalletTransactionsCDP';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const ReactiveTransactionsList: React.FC = () => {
  const { data: transactions = [], isLoading, sync, isSyncing } = useWalletTransactionsCDP();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowUpRight className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatAmount = (amount: number, type: string, currency: string) => {
    const sign = type === 'withdrawal' ? '-' : '+';
    const decimals = currency === 'USDT' || currency === 'USDC' ? 2 : 4;
    return `${sign}${amount.toFixed(decimals)} ${currency}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transactions
            {isSyncing && (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => sync()} 
            disabled={isSyncing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No transactions</p>
            <p className="text-sm">Your transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.created_at), { 
                            addSuffix: true, 
                            locale: enUS 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${
                        transaction.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {formatAmount(transaction.amount, transaction.type, transaction.currency || 'MATIC')}
                      </p>
                      {transaction.fee && (
                        <p className="text-xs text-muted-foreground">
                          Fee: {transaction.fee.toFixed(6)} MATIC
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-mono">
                      {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
