import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/ui';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Filter,
  History 
} from "lucide-react";
// import { useReactiveWallet } from '@/hooks/useReactiveWallet';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { Transaction } from '@/integrations/supabase/payments.types';

type TransactionFilter = 'all' | 'deposits' | 'withdrawals' | 'pending' | 'completed';

export const ReactiveTransactionsList: React.FC = () => {
  // const { transactions, isLoading, realtimeStatus, refreshWallet } = useReactiveWallet();
  const transactions: Transaction[] = [];
  const isLoading = false;
  const [realtimeStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const refreshWallet = () => {};
  const [filter, setFilter] = useState<TransactionFilter>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'Withdrawal':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'Failed':
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      switch (filter) {
        case 'deposits':
          return transaction.type === 'Deposit';
        case 'withdrawals':
          return transaction.type === 'Withdrawal';
        case 'pending':
          return transaction.status === 'Pending';
        case 'completed':
          return transaction.status === 'Success';
        default:
          return true;
      }
    });
  }, [transactions, filter]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
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
            {realtimeStatus === 'connected' && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshWallet}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as TransactionFilter)}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="deposits" className="text-xs">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals" className="text-xs">Withdrawals</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {filter === 'all' 
                    ? 'No transactions' 
                    : `No ${filter === 'deposits' ? 'deposit' : filter === 'withdrawals' ? 'withdrawal' : filter} transactions`
                  }
                </p>
                <p className="text-sm">
                  {filter === 'all' 
                    ? 'Your transactions will appear here'
                    : 'Change the filter to see other transactions'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <Card 
                    key={transaction.id} 
                    className={cn(
                      "transition-all duration-200 hover:shadow-md border",
                      transaction.status === 'Success' && "border-green-200 dark:border-green-800",
                      transaction.status === 'Pending' && "border-yellow-200 dark:border-yellow-800",
                      (transaction.status === 'Failed' || transaction.status === 'Rejected') && "border-red-200 dark:border-red-800"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getTypeIcon(transaction.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{transaction.type}</span>
                              <Badge className={cn("text-xs", getStatusColor(transaction.status))}>
                                {transaction.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {transaction.description || `${transaction.type} transaction`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(transaction.created_at), { 
                                addSuffix: true, 
                                locale: enUS 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            "font-semibold",
                            transaction.type === 'Deposit' ? "text-green-600" : "text-red-600"
                          )}>
                            {transaction.type === 'Deposit' ? '+' : '-'}{formatAmount(transaction.amount)}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {getStatusIcon(transaction.status)}
                            <span className="text-xs text-muted-foreground">
                              {transaction.payment_method || 'Standard'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
