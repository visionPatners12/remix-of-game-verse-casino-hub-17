import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Maximize, Minimize } from 'lucide-react';

interface SmartVideoContainerProps {
  url: string;
  poster?: string;
  start?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Modern, responsive video container with custom poster and deferred loading
 * - Fixed 16:9 aspect ratio with no CLS
 * - Custom poster + play button before click
 * - ReactPlayer loads only after user interaction
 * - Full keyboard accessibility
 */
export default function SmartVideoContainer({
  url,
  poster,
  start,
  className = '',
  ariaLabel = 'Lire la vidéo'
}: SmartVideoContainerProps) {
  const [hasClicked, setHasClicked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback if no URL provided
  if (!url || url.trim() === '') {
    return (
      <div className={`relative overflow-hidden bg-muted aspect-[16/9] rounded-xl ${className} flex items-center justify-center`}>
        <span className="text-muted-foreground text-sm">Video unavailable</span>
      </div>
    );
  }

  // Gérer les changements de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Gérer les changements d'orientation - maintenir le fullscreen stable
  useEffect(() => {
    const handleOrientationChange = () => {
      // Si on est en fullscreen, on ne fait rien pour éviter les sorties accidentelles
      if (document.fullscreenElement && containerRef.current) {
        // Forcer le re-focus sur le container pour maintenir le fullscreen
        containerRef.current.focus();
      }
    };
    
    screen.orientation?.addEventListener('change', handleOrientationChange);
    return () => screen.orientation?.removeEventListener('change', handleOrientationChange);
  }, []);

  // Bloquer le scroll du body pendant le fullscreen mobile
  useEffect(() => {
    if (hasClicked && isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalWidth = document.body.style.width;
      const originalHeight = document.body.style.height;
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = originalWidth;
        document.body.style.height = originalHeight;
      };
    }
  }, [hasClicked, isFullscreen]);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (document.fullscreenElement) {
      // Exit fullscreen - unlock orientation
      try {
        if (screen.orientation && 'unlock' in screen.orientation) {
          (screen.orientation as any).unlock();
        }
      } catch (e) {
        console.log('Orientation unlock not supported');
      }
      await document.exitFullscreen();
    } else {
      // Enter fullscreen - then lock to landscape
      await container.requestFullscreen();
      try {
        if (screen.orientation && 'lock' in screen.orientation) {
          await (screen.orientation as any).lock('landscape');
        }
      } catch (e) {
        console.log('Orientation lock not supported');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setHasClicked(true);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden bg-black ${
        isFullscreen 
          ? 'w-screen h-screen fixed inset-0 z-50' 
          : 'aspect-[16/9] rounded-xl'
      } ${className}`}
    >
      {!hasClicked ? (
        // ========== POSTER STATE ==========
        <>
          {/* Poster image */}
          {poster && (
            <img
              src={poster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Play button overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHasClicked(true);
            }}
            onKeyDown={handleKeyPress}
            className="absolute inset-0 flex items-center justify-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-0"
            aria-label={ariaLabel}
            aria-pressed={hasClicked}
            type="button"
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

            {/* Play button circle */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/90 group-hover:scale-110 transition-all duration-300 shadow-2xl">
              <svg
                className="w-10 h-10 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        </>
      ) : (
        // ========== PLAYER STATE ==========
        <>
          {/* Control buttons overlay */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              type="button"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          <div className="absolute inset-0 w-full h-full" onClick={(e) => e.stopPropagation()}>
            <ReactPlayer
            url={url}
            playing={true}
            controls={true}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  start: start || 0,
                }
              },
              vimeo: {
                playerOptions: {
                  start: start || 0,
                }
              },
              file: {
                attributes: {
                  preload: 'auto',
                  playsInline: true,
                  crossOrigin: 'anonymous',
                },
                forceVideo: true,
              }
            }}
          />
          </div>
        </>
      )}
    </div>
  );
}
