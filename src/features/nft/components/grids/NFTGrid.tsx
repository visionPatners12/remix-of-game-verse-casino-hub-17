import React, { useMemo, useState } from 'react';
import { NFTCard } from '../cards/NFTCard';
import { NFTModal } from '../modals/NFTModal';
import { mockNFTs } from '../../services';
import { type NFT } from '../../types';

interface NFTGridProps {
  searchQuery: string;
  sortBy: string;
  filterBy: string;
  viewMode: 'grid' | 'list';
}

export function NFTGrid({ searchQuery, sortBy, filterBy, viewMode }: NFTGridProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  // Filter and sort NFTs
  const filteredNFTs = useMemo(() => {
    let filtered = mockNFTs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.collection.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(nft => {
        switch (filterBy) {
          case 'available':
            return nft.status === 'available';
          case 'sold':
            return nft.status === 'sold';
          case 'auction':
            return nft.status === 'auction';
          case 'legendary':
            return nft.rarity === 'Legendary';
          case 'epic':
            return nft.rarity === 'Epic';
          case 'rare':
            return nft.rarity === 'Rare';
          case 'common':
            return nft.rarity === 'Common';
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'rarity':
          const rarityOrder = { 'Legendary': 4, 'Epic': 3, 'Rare': 2, 'Common': 1 };
          return (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [searchQuery, sortBy, filterBy]);

  const gridClassName = viewMode === 'grid' 
    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
    : "flex flex-col gap-4";

  if (filteredNFTs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🖼️</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No NFTs found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      <div className={gridClassName}>
        {filteredNFTs.map((nft) => (
          <NFTCard
            key={nft.id}
            nft={nft}
            viewMode={viewMode}
            onClick={() => setSelectedNFT(nft)}
          />
        ))}
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <NFTModal
          nft={selectedNFT}
          isOpen={!!selectedNFT}
          onClose={() => setSelectedNFT(null)}
        />
      )}
    </>
  );
}