import React, { useState, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { cn } from '@/lib/utils';

interface VideoViewerProps {
  src: string;
  alt?: string;
  className?: string;
  displayMode?: 'contain' | 'cover' | 'fill';
  aspectRatio?: 'auto' | 'square' | '16/9' | '4/3';
  enableFullscreen?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  isInView?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

export function VideoViewer({
  src,
  alt = 'Video',
  className,
  displayMode = 'contain',
  aspectRatio = 'auto',
  enableFullscreen = false,
  autoplay = false,
  muted = true,
  loop = false,
  isInView = true,
  onPlay,
  onPause,
}: VideoViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    videoRef,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    showControls,
    isLoading,
    showControlsTemporarily,
    togglePlay,
    toggleMute,
    seekTo,
    toggleFullscreen: videoToggleFullscreen,
  } = useVideoPlayer({
    autoplay: autoplay && isInView,
    muted,
    loop,
    onPlay,
    onPause,
  });

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enableFullscreen) {
      setIsFullscreen(true);
    } else {
      togglePlay();
    }
  };

  const handleFullscreenClose = () => {
    setIsFullscreen(false);
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case '16/9':
        return 'aspect-video';
      case '4/3':
        return 'aspect-[4/3]';
      default:
        return '';
    }
  };

  const getObjectFitClass = () => {
    switch (displayMode) {
      case 'cover':
        return 'object-cover';
      case 'fill':
        return 'object-fill';
      default:
        return 'object-contain';
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Main Video */}
      <div
        ref={containerRef}
        className={cn(
          'relative group cursor-pointer rounded-lg overflow-hidden bg-muted/50',
          getAspectRatioClass(),
          className
        )}
        onClick={handleVideoClick}
        onMouseMove={handleMouseMove}
      >
          <video
            ref={videoRef}
            src={src}
            className={cn('w-full h-full', getObjectFitClass())}
            autoPlay={autoplay && isInView}
            muted={muted}
            loop={loop}
            playsInline
          />
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        )}

        {/* Play button overlay */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Compact controls */}
        {(showControls || !isPlaying) && !enableFullscreen && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="hover:bg-white/20 rounded p-1"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="hover:bg-white/20 rounded p-1"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              
              <div className="flex-1 mx-2">
                <div className="bg-white/20 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-150"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <span className="text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={handleFullscreenClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Video with zoom capabilities */}
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={3}
              wheel={{ step: 0.1 }}
              pinch={{ step: 5 }}
              doubleClick={{ mode: 'reset' }}
            >
              <TransformComponent
                wrapperClass="w-full h-full flex items-center justify-center"
                contentClass="max-w-full max-h-full"
              >
                <div
                  className="relative max-w-full max-h-full"
                  onMouseMove={handleMouseMove}
                >
                  <video
                    ref={videoRef}
                    src={src}
                    className="max-w-full max-h-full object-contain"
                    autoPlay={autoplay}
                    muted={muted}
                    loop={loop}
                    playsInline
                  />

                  {/* Fullscreen controls */}
                  {showControls && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <div className="flex items-center gap-4 text-white">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlay();
                          }}
                          className="hover:bg-white/20 rounded p-2"
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMute();
                          }}
                          className="hover:bg-white/20 rounded p-2"
                        >
                          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                        </button>
                        
                        <div className="flex-1 mx-4">
                          <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => seekTo(Number(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                          />
                        </div>
                        
                        <span className="text-sm font-medium min-w-20">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            videoToggleFullscreen();
                          }}
                          className="hover:bg-white/20 rounded p-2"
                        >
                          <Maximize className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}
    </>
  );
}