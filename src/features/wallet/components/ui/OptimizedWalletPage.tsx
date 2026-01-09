import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactiveWalletCard } from './ReactiveWalletCard';
import { WalletTokensList } from './WalletTokensList';
import { MobileWalletPage } from '../mobile/MobileWalletPage';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { History, ArrowLeft } from 'lucide-react';

export const OptimizedWalletPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Use native mobile design on mobile devices
  if (isMobile) {
    return <MobileWalletPage />;
  }

  // Desktop version
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(-1)}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      {/* Reactive Wallet Cards */}
      <ReactiveWalletCard showActions={true} compact={false} />
      
      {/* Wallet Tokens by Chain */}
      <WalletTokensList />
      
      {/* Quick Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
            <p className="text-muted-foreground">
              View all your detailed transactions
            </p>
          </div>
          <Button 
            disabled
            className="gap-2"
          >
            <History className="h-4 w-4" />
            Coming Soon
          </Button>
        </div>
      </Card>
    </div>
  );
};