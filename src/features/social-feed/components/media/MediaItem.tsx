import React from 'react';
import { Play } from 'lucide-react';
import type { MediaItem as MediaItemType } from '../../types/media';

interface MediaItemProps {
  media: MediaItemType;
  className?: string;
  showOverlay?: { count: number };
  autoplay?: boolean;
  onClick?: () => void;
  fitMode?: 'cover' | 'contain' | 'adaptive';
}

export function MediaItem({ media, className = '', showOverlay, autoplay = false, onClick, fitMode = 'cover' }: MediaItemProps) {
  const objectFitClass = fitMode === 'contain' ? 'object-contain' : 'object-cover';
  const baseClasses = `w-full h-full ${objectFitClass} transition-all duration-300`;
  
  const content = media.type === 'video' ? (
    <div className="relative w-full h-full group">
      <video 
        src={media.url}
        muted
        loop
        playsInline
        className={`${baseClasses} ${className}`}
        aria-label={media.alt || 'Video content'}
      />
      {!autoplay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
            <Play className="h-6 w-6 text-primary-foreground fill-current ml-0.5" />
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="relative w-full h-full bg-muted animate-pulse">
      <img 
        src={media.url}
        alt={media.alt || 'Image content'}
        className={`${baseClasses} ${className} animate-none`}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        onLoad={(e) => {
          e.currentTarget.parentElement?.classList.remove('animate-pulse');
        }}
      />
    </div>
  );

  return (
    <div 
      className="relative overflow-hidden cursor-pointer hover:brightness-90 transition-all duration-300"
      onClick={onClick}
    >
      {content}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-white font-bold text-3xl">
            +{showOverlay.count}
          </span>
        </div>
      )}
    </div>
  );
}