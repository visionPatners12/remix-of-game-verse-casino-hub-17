import { useState } from 'react';
import { Wallet, Images, RefreshCw, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNFTData } from '../hooks/useNFTData';
import { PryzenNFTCard } from '../components/cards/PryzenNFTCard';
import { NFTDetailModal } from '../components/NFTDetailModal';
import { Button } from '@/components/ui/button';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { ThirdWebNFT } from '../types';

const PryzenCardPage = () => {
  const navigate = useNavigate();
  const { nfts, isLoading, error, isConnected, walletAddress, refetch } = useNFTData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<ThirdWebNFT | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const RefreshButton = () => (
    <button 
      onClick={handleRefresh} 
      disabled={isRefreshing}
      className="p-2 -mr-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
    </button>
  );

  // Wallet not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <MobilePageHeader title="My Pryze" />
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            Connect your wallet to see your Pryze NFTs
          </p>
          <Button onClick={() => navigate('/wallet')} className="gap-2">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobilePageHeader title="My Pryze" />
        <div className="p-4">
          <div className="h-20 bg-muted/50 rounded-2xl mb-4 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MobilePageHeader title="My Pryze" />
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <Images className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Error</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            {error.message || 'Unable to load your NFTs'}
          </p>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No NFTs
  if (nfts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <MobilePageHeader title="My Pryze" rightContent={<RefreshButton />} />
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Pryze NFTs</h2>
          <p className="text-muted-foreground text-center mb-2 max-w-sm">
            You don't have any Pryze NFTs in your wallet yet
          </p>
          <p className="text-xs text-muted-foreground/70 text-center mb-6">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  // NFTs found
  return (
    <div className="min-h-screen bg-background pb-6">
      <MobilePageHeader title="My Pryze" rightContent={<RefreshButton />} />


      {/* NFT Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {nfts.map((nft, index) => (
            <motion.div
              key={`${nft.token_address}-${nft.token_id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PryzenNFTCard 
                nft={nft} 
                onClick={() => setSelectedNFT(nft)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <NFTDetailModal
        nft={selectedNFT}
        isOpen={!!selectedNFT}
        onClose={() => setSelectedNFT(null)}
      />
    </div>
  );
};

export default PryzenCardPage;
