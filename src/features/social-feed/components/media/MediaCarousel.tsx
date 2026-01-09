import React, { useState } from 'react';
import { AdaptiveMediaItem } from './AdaptiveMediaItem';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';
import type { MediaGridProps } from '../../types/media';

export function MediaCarousel({ media, className = '' }: MediaGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Configuration du swipe
  const { swipeHandlers } = useSwipeGestures({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
    threshold: 50
  });

  return (
    <div className={`-mx-4 mb-3 ${className}`}>
      <div className="relative">
        {/* Image principale avec swipe */}
        <div 
          className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none carousel-snap"
          {...swipeHandlers}
        >
          <AdaptiveMediaItem 
            media={media[currentIndex]}
          />
          
          {/* Compteur d'images */}
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 text-xs font-medium backdrop-blur-sm">
            {currentIndex + 1} / {media.length}
          </div>
        </div>

        {/* Indicateurs de pagination */}
        {media.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}