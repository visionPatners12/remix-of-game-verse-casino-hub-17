import { useState } from 'react';
import { MediaLightbox } from './MediaLightbox';
import type { MediaGridProps, MediaItem as MediaItemType } from '../../types/media';
import { AdaptiveMediaItem } from './AdaptiveMediaItem';

interface GridMediaItemProps {
  media: MediaItemType;
  onClick: () => void;
  showOverlay?: { count: number };
  className?: string;
}

function GridMediaItem({ media, onClick, showOverlay, className = '' }: GridMediaItemProps) {
  const [loaded, setLoaded] = useState(false);

  if (media.type === 'video') {
    return (
      <div 
        className={`relative bg-black cursor-pointer hover:brightness-90 transition-all duration-300 ${className}`}
        onClick={onClick}
      >
        <video 
          src={media.url}
          autoPlay
          muted
          loop
          playsInline
          controls
          className="w-full h-full object-contain"
        />
        {showOverlay && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
            <span className="text-white font-bold text-3xl">+{showOverlay.count}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer hover:brightness-90 transition-all duration-300 bg-black flex items-center justify-center ${className}`}
      onClick={onClick}
    >
      <img 
        src={media.url}
        alt={media.alt || 'Image'}
        className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
      {showOverlay && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-white font-bold text-3xl">+{showOverlay.count}</span>
        </div>
      )}
    </div>
  );
}

export function MediaGrid({ media, className = '' }: MediaGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const count = media.length;
  const displayCount = Math.min(count, 4);
  
  const handleMediaClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Single media - use adaptive component
  if (displayCount === 1) {
    const isSingleVideo = media[0].type === 'video';
    
    return (
      <>
        <div className={`-mx-4 mb-3 ${className}`}>
          <AdaptiveMediaItem 
            media={media[0]} 
            onClick={isSingleVideo ? undefined : () => handleMediaClick(0)}
          />
        </div>
        {!isSingleVideo && (
          <MediaLightbox
            media={media}
            initialIndex={lightboxIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </>
    );
  }

  // Two images - side by side with equal height
  if (displayCount === 2) {
    return (
      <>
        <div className={`-mx-4 mb-3 ${className}`}>
          <div className="grid grid-cols-2 gap-0.5 overflow-hidden aspect-[2/1]">
            {media.slice(0, 2).map((item, index) => (
              <GridMediaItem 
                key={item.id || index}
                media={item}
                onClick={() => handleMediaClick(index)}
              />
            ))}
          </div>
        </div>
        <MediaLightbox
          media={media}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }

  // Three images - one large left, two stacked right
  if (displayCount === 3) {
    return (
      <>
        <div className={`-mx-4 mb-3 ${className}`}>
          <div className="grid grid-cols-2 gap-0.5 overflow-hidden aspect-[4/3]">
            <GridMediaItem 
              media={media[0]}
              onClick={() => handleMediaClick(0)}
              className="row-span-2"
            />
            <GridMediaItem 
              media={media[1]}
              onClick={() => handleMediaClick(1)}
            />
            <GridMediaItem 
              media={media[2]}
              onClick={() => handleMediaClick(2)}
            />
          </div>
        </div>
        <MediaLightbox
          media={media}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }

  // Four or more images - 2x2 grid
  return (
    <>
      <div className={`-mx-4 mb-3 ${className}`}>
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden aspect-square max-h-[400px]">
          {media.slice(0, 4).map((item, index) => (
            <GridMediaItem 
              key={item.id || index}
              media={item}
              onClick={() => handleMediaClick(index)}
              showOverlay={index === 3 && count > 4 ? { count: count - 4 } : undefined}
            />
          ))}
        </div>
      </div>
      <MediaLightbox
        media={media}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
