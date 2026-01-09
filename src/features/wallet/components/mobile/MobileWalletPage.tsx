import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileWalletCard } from './MobileWalletCard';
import { MobileTokensList } from './MobileTokensList';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { WalletGamingStats } from '@/components/wallet/WalletGamingStats';

export const MobileWalletPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Fallback to desktop version if not on mobile
  if (!isMobile) {
    return null;
  }

  // Mock gaming stats - in production, fetch from Supabase
  const mockGamingStats = {
    totalWinnings: 1250,
    gamesPlayed: 47,
    winRate: 62,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobilePageHeader title="Wallet" showBack={true} />
      
      {/* Hero Balance Section */}
      <MobileWalletCard />
      
      {/* Gaming Stats Section */}
      <WalletGamingStats 
        totalWinnings={mockGamingStats.totalWinnings}
        gamesPlayed={mockGamingStats.gamesPlayed}
        winRate={mockGamingStats.winRate}
        className="mt-4"
      />
      
      {/* Tokens List */}
      <div className="mt-4">
        <MobileTokensList />
      </div>
      
      {/* Transactions Quick Access */}
      <div className="px-4 mt-6">
        <Button
          variant="outline"
          className="w-full h-12 justify-between"
          onClick={() => navigate('/transactions')}
        >
          <span>View transaction history</span>
          <History className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};