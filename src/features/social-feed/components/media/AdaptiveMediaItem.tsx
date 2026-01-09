import { useState, useRef } from 'react';
import type { MediaItem as MediaItemType } from '../../types/media';

interface AdaptiveMediaItemProps {
  media: MediaItemType;
  onClick?: () => void;
}

type ImageOrientation = 'loading' | 'landscape' | 'portrait' | 'square';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AdaptiveMediaItem({ media, onClick }: AdaptiveMediaItemProps) {
  const [orientation, setOrientation] = useState<ImageOrientation>('loading');
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    
    if (ratio > 1.2) {
      setOrientation('landscape');
    } else if (ratio < 0.8) {
      setOrientation('portrait');
    } else {
      setOrientation('square');
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (media.type === 'video') {
    const remaining = duration ? duration - currentTime : null;
    
    return (
      <div 
        className="relative w-full aspect-video max-h-[500px] bg-black cursor-pointer"
        onClick={onClick || togglePlayPause}
      >
        <video 
          ref={videoRef}
          src={media.url}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-contain pointer-events-none"
          aria-label={media.alt || 'Video content'}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {remaining !== null && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded pointer-events-none animate-fade-in">
            {formatDuration(remaining)}
          </div>
        )}
      </div>
    );
  }

  // Landscape: aspect-[16/10] + centered with black bands
  if (orientation === 'landscape') {
    return (
      <div 
        className="relative w-full aspect-[16/10] max-h-[500px] overflow-hidden cursor-pointer hover:brightness-90 transition-all duration-300 bg-black flex items-center justify-center"
        onClick={onClick}
      >
        <img 
          src={media.url}
          alt={media.alt || 'Image content'}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  // Portrait: aspect-[3/4] + centered with black bands
  if (orientation === 'portrait') {
    return (
      <div 
        className="relative w-full aspect-[3/4] max-h-[500px] overflow-hidden cursor-pointer hover:brightness-90 transition-all duration-300 bg-black flex items-center justify-center"
        onClick={onClick}
      >
        <img 
          src={media.url}
          alt={media.alt || 'Image content'}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  // Square: aspect-square + centered with black bands
  if (orientation === 'square') {
    return (
      <div 
        className="relative w-full aspect-square max-h-[500px] overflow-hidden cursor-pointer hover:brightness-90 transition-all duration-300 bg-black flex items-center justify-center"
        onClick={onClick}
      >
        <img 
          src={media.url}
          alt={media.alt || 'Image content'}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  // Loading state - same pattern with black background
  return (
    <div 
      className="relative w-full aspect-[16/10] max-h-[500px] overflow-hidden cursor-pointer bg-black flex items-center justify-center"
      onClick={onClick}
    >
      <img 
        src={media.url}
        alt={media.alt || 'Image content'}
        className="max-w-full max-h-full object-contain opacity-0"
        loading="lazy"
        decoding="async"
        onLoad={handleImageLoad}
      />
    </div>
  );
}
