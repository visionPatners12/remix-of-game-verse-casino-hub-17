import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useFullscreen } from '@/contexts/FullscreenContext';
import type { MediaItem } from '../../types/media';

interface MediaLightboxProps {
  media: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaLightbox({ media, initialIndex, isOpen, onClose }: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { enterFullscreen, exitFullscreen } = useFullscreen();

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Manage fullscreen state
  useEffect(() => {
    if (isOpen) {
      enterFullscreen();
    }
    return () => {
      if (isOpen) {
        exitFullscreen();
      }
    };
  }, [isOpen, enterFullscreen, exitFullscreen]);

  const handleClose = useCallback(() => {
    exitFullscreen();
    onClose();
  }, [exitFullscreen, onClose]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  }, [media.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  }, [media.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, goToPrevious, goToNext, handleClose]);

  const currentMedia = media[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[10001] flex items-center justify-center"
        >
          {/* Background overlay */}
          <motion.div 
            className="absolute inset-0 bg-black"
            onClick={handleClose}
          />

          {/* Close button - single, prominent */}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full h-12 w-12"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Counter - subtle, bottom center */}
          {media.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
              {currentIndex + 1} / {media.length}
            </div>
          )}

          {/* Previous button */}
          {media.length > 1 && (
            <Button
              onClick={goToPrevious}
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full h-12 w-12"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Media content with zoom */}
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
            {currentMedia.type === 'video' ? (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain rounded-lg"
                aria-label={currentMedia.alt || 'Video content'}
              />
            ) : (
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
                doubleClick={{ mode: 'toggle', step: 2 }}
              >
                <TransformComponent
                  wrapperClass="!w-full !h-full"
                  contentClass="!w-full !h-full !flex !items-center !justify-center"
                >
                  <img
                    src={currentMedia.url}
                    alt={currentMedia.alt || 'Image content'}
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                  />
                </TransformComponent>
              </TransformWrapper>
            )}
          </div>

          {/* Next button */}
          {media.length > 1 && (
            <Button
              onClick={goToNext}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full h-12 w-12"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
