import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, ExternalLink, Clock, Eye, TrendingUp } from 'lucide-react';
import { type NFT } from '../../types';

interface NFTModalProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
}

export function NFTModal({ nft, isOpen, onClose }: NFTModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{nft.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
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
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Favorite
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Header Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getRarityColor(nft.rarity)}>{nft.rarity}</Badge>
                <Badge variant="outline" className={getStatusColor(nft.status)}>
                  {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground">{nft.collection}</p>
              <p className="text-sm text-muted-foreground">Token ID: #{nft.tokenId}</p>
            </div>

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">{nft.price} ETH</span>
                <span className="text-muted-foreground">${(nft.price * 3000).toLocaleString()}</span>
              </div>
              {nft.status === 'auction' && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Auction ends in 2d 14h 32m
                </div>
              )}
            </div>

            {/* Action Button */}
            {nft.status === 'available' && (
              <Button className="w-full" size="lg">
                Buy Now
              </Button>
            )}
            {nft.status === 'auction' && (
              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  Place Bid
                </Button>
                <Button variant="outline" className="w-full">
                  Buy Now for {(nft.price * 1.2).toFixed(2)} ETH
                </Button>
              </div>
            )}
            {nft.status === 'sold' && (
              <Button disabled className="w-full" size="lg">
                Sold Out
              </Button>
            )}

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">1.2k</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  Views
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">456</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4" />
                  Likes
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">+12%</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  24h
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {nft.description}
              </p>
            </div>

            {/* Properties */}
            <div className="space-y-3">
              <h3 className="font-semibold">Properties</h3>
              <div className="grid grid-cols-2 gap-3">
                {nft.attributes.map((attr, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      {attr.trait_type}
                    </div>
                    <div className="font-semibold">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}