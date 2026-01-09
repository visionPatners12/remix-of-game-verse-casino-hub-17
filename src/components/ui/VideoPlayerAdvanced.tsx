
import React, { useEffect } from 'react';
import { VideoControls } from './VideoControls';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { Play } from 'lucide-react';

interface VideoPlayerAdvancedProps {
  src: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onFocus?: () => void;
  onClick?: () => void;
  isInView?: boolean;
  showInitialPlayButton?: boolean;
}

export function VideoPlayerAdvanced({
  src,
  title,
  autoplay = false,
  muted = true,
  loop = false,
  className = "",
  onPlay,
  onPause,
  onFocus,
  onClick,
  isInView = true,
  showInitialPlayButton = false,
}: VideoPlayerAdvancedProps) {
  const {
    videoRef,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    buffered,
    showControls,
    isLoading,
    showControlsTemporarily,
    togglePlay,
    toggleMute,
    seekTo,
    toggleFullscreen,
    requestPictureInPicture,
  } = useVideoPlayer({
    autoplay,
    muted,
    loop,
    onPlay,
    onPause,
  });

  // Handle in-view autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView && autoplay && !isPlaying) {
      video.play().catch(() => {
        // Autoplay failed, show play button
      });
    } else if (!isInView && isPlaying) {
      video.pause();
    }
  }, [isInView, autoplay, isPlaying]);

  const handleVideoClick = () => {
    togglePlay();
    onFocus?.();
    showControlsTemporarily();
    onClick?.();
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => showControlsTemporarily()}
      onClick={handleVideoClick}
      tabIndex={0}
      role="button"
      aria-label={`Video player${title ? `: ${title}` : ''}`}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        muted={isMuted}
        loop={loop}
        playsInline
        preload="metadata"
        style={{ aspectRatio: 'inherit' }}
      />

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Initial play button overlay (when video hasn't started yet) */}
      {!isPlaying && !isLoading && showInitialPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-6 shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-12 h-12 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Center play button (appears on pause) */}
      {!isPlaying && !isLoading && !showInitialPlayButton && showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <Play className="w-8 h-8 text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Advanced controls */}
      <VideoControls
        isPlaying={isPlaying}
        isMuted={isMuted}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        showControls={showControls}
        isLoading={isLoading}
        onPlayPause={togglePlay}
        onMute={toggleMute}
        onSeek={seekTo}
        onFullscreen={toggleFullscreen}
        onPictureInPicture={requestPictureInPicture}
        showTimeOnHover={true}
      />

      {/* Keyboard shortcuts hint (only shown on first hover) */}
      {showControls && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-70 transition-opacity duration-500 delay-1000">
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            <div>Raccourcis: espace (play), ← → (±5s), M (mute), F (plein écran)</div>
          </div>
        </div>
      )}
    </div>
  );
}
