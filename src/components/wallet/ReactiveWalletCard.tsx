import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/ui';
import { TrendingUp, TrendingDown, Wallet, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';
// import { useReactiveWallet } from '@/hooks/useReactiveWallet';
import { cn } from '@/lib/utils';

interface ReactiveWalletCardProps {
  showActions?: boolean;
  compact?: boolean;
}

export const ReactiveWalletCard: React.FC<ReactiveWalletCardProps> = ({ 
  showActions = true, 
  compact = false 
}) => {
  const navigate = useNavigate();
  // const { 
  //   realBalance, 
  //   bonusBalance, 
  //   totalBalance, 
  //   isLoading, 
  //   realtimeStatus,
  //   isRealTimeConnected,
  //   refreshWallet 
  // } = useReactiveWallet();
  const realBalance = 0;
  const bonusBalance = 0;
  const totalBalance = 0;
  const isLoading = false;
  const realtimeStatus = 'disconnected';
  const isRealTimeConnected = false;
  const refreshWallet = () => {};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time Status Indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          My Wallet
        </h2>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isRealTimeConnected ? "default" : "secondary"}
            className={cn(
              "text-xs",
              isRealTimeConnected 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
            )}
          >
            {isRealTimeConnected ? (
              <><Wifi className="h-3 w-3 mr-1" /> Live</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" /> {realtimeStatus}</>
            )}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshWallet}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className={cn(
        "grid gap-4",
        compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
      )}>
        {/* Real Balance */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Main Balance
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(realBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        {/* Bonus Balance */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Bonus Balance
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(bonusBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bonuses and promotions
            </p>
          </CardContent>
        </Card>

        {/* Total Balance */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total available balance
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};