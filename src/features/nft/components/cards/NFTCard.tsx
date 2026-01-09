import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Heart, ShoppingCart } from 'lucide-react';
import { type NFT } from '../../types';

interface NFTCardProps {
  nft: NFT;
  viewMode: 'grid' | 'list';
  showPrice?: boolean;
  onClick: () => void;
}

export function NFTCard({ nft, viewMode, showPrice = true, onClick }: NFTCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'Epic':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'Rare':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'Common':
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'sold':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'auction':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur-sm border-border/50"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0">
              <img 
                src={nft.image} 
                alt={nft.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground truncate">{nft.name}</h3>
                  <p className="text-sm text-muted-foreground">{nft.collection}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRarityColor(nft.rarity)}>{nft.rarity}</Badge>
                    <Badge variant="outline" className={getStatusColor(nft.status)}>
                      {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  {showPrice && (
                    <>
                      <div className="text-lg font-bold text-primary">{nft.price} ETH</div>
                      <div className="text-sm text-muted-foreground">${(nft.price * 3000).toLocaleString()}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur-sm border-border/50 group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 to-secondary/20">
          <img 
            src={nft.image} 
            alt={nft.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
              <Heart className="h-4 w-4" />
            </Button>
            {showPrice && nft.status === 'available' && (
              <Button size="sm" variant="default" className="h-8 w-8 p-0">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Status Badge */}
          <Badge 
            variant="outline" 
            className={`absolute top-2 right-2 ${getStatusColor(nft.status)}`}
          >
            {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
          </Badge>
        </div>

        {/* Card Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate text-sm">{nft.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{nft.collection}</p>
            </div>
            <Badge className={`${getRarityColor(nft.rarity)} text-xs ml-2 flex-shrink-0`}>
              {nft.rarity}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            {showPrice ? (
              <>
                <div>
                  <div className="text-sm font-bold text-primary">{nft.price} ETH</div>
                  <div className="text-xs text-muted-foreground">${(nft.price * 3000).toLocaleString()}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  #{nft.tokenId}
                </div>
              </>
            ) : (
              <div className="w-full text-center">
                <div className="text-xs text-muted-foreground">#{nft.tokenId}</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}