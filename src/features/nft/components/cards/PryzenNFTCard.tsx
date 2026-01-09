import { memo, useState } from 'react';
import { Trophy, Eye } from 'lucide-react';
import { ThirdWebNFT } from '../../types';
import { getBestMediaUrl } from '../../services/nftService';

interface PryzenNFTCardProps {
  nft: ThirdWebNFT;
  onClick?: () => void;
}

export const PryzenNFTCard = memo(({ nft, onClick }: PryzenNFTCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const imageUrl = getBestMediaUrl(nft);
  const displayName = nft.name || nft.collection?.name || 'Unnamed NFT';
  const tokenId = nft.token_id;

  return (
    <button
      onClick={onClick}
      className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/50 transition-all duration-300 active:scale-[0.97] hover:ring-2 hover:ring-primary/50 hover:shadow-xl hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Image */}
      <img
        src={imageUrl}
        alt={displayName}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      
      {/* Error fallback */}
      {imageError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <Trophy className="w-12 h-12 text-muted-foreground/30" />
        </div>
      )}
      
      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
        <h3 className="text-white text-sm font-semibold truncate leading-tight">
          {displayName}
        </h3>
        <p className="text-white/50 text-xs mt-1">
          #{tokenId}
        </p>
      </div>

      {/* Hover overlay with eye icon */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Eye className="w-6 h-6 text-white" />
        </div>
      </div>
    </button>
  );
});

PryzenNFTCard.displayName = 'PryzenNFTCard';
