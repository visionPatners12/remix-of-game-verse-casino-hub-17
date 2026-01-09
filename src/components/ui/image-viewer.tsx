import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence } from 'framer-motion';
import { useFullscreen } from '@/contexts/FullscreenContext';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
  displayMode?: 'cover' | 'contain' | 'auto';
  enableFullscreen?: boolean;
  aspectRatio?: 'auto' | 'square' | '16/9' | '4/3';
}

export function ImageViewer({ 
  src, 
  alt, 
  className, 
  displayMode = 'contain',
  enableFullscreen = true,
  aspectRatio = 'auto'
}: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  
  const openFullscreen = useCallback(() => {
    setIsOpen(true);
    enterFullscreen();
  }, [enterFullscreen]);

  const closeFullscreen = useCallback(() => {
    setIsOpen(false);
    exitFullscreen();
  }, [exitFullscreen]);

  const handleSwipeDown = useCallback((e: any) => {
    if (e.deltaY > 50) {
      closeFullscreen();
    }
  }, [closeFullscreen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeFullscreen]);

  const getImageClasses = () => {
    const baseClasses = "w-full transition-transform hover:scale-[1.02]";
    
    switch (displayMode) {
      case 'cover':
        return cn(baseClasses, "h-full object-cover");
      case 'contain':
        return cn(baseClasses, "h-auto max-h-80 object-contain");
      case 'auto':
        return cn(baseClasses, "h-auto max-h-80");
      default:
        return cn(baseClasses, "h-auto max-h-80 object-contain");
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "relative rounded-lg overflow-hidden";
    
    switch (aspectRatio) {
      case 'square':
        return cn(baseClasses, "aspect-square bg-muted/20");
      case '16/9':
        return cn(baseClasses, "aspect-video bg-muted/20");
      case '4/3':
        return cn(baseClasses, "aspect-[4/3] bg-muted/20");
      default:
        return cn(baseClasses, displayMode === 'contain' ? "inline-block" : "bg-muted/20");
    }
  };

  return (
    <>
      <div className={cn(getContainerClasses(), className)}>
        <img
          src={src}
          alt={alt}
          className={cn(
            getImageClasses(),
            enableFullscreen && "cursor-pointer"
          )}
          onClick={(e) => {
            e.stopPropagation();
            enableFullscreen && openFullscreen();
          }}
          loading="lazy"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black"
              onClick={closeFullscreen}
            />
            
            {/* Single close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Image with zoom capabilities */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-0 w-full h-full flex items-center justify-center p-4"
            >
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                doubleClick={{ disabled: false, mode: "toggle", step: 0.7 }}
                wheel={{ wheelDisabled: false, touchPadDisabled: false, step: 0.1 }}
                pinch={{ disabled: false, step: 5 }}
                panning={{ disabled: false, velocityDisabled: false }}
                onPanningStop={handleSwipeDown}
                centerOnInit={true}
              >
                <TransformComponent
                  wrapperClass="!w-full !h-full flex items-center justify-center"
                  contentClass="flex items-center justify-center"
                >
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                  />
                </TransformComponent>
              </TransformWrapper>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
