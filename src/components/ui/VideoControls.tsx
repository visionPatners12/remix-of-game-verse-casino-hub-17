
import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, PictureInPicture2 } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  showControls: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onMute: () => void;
  onSeek: (time: number) => void;
  onFullscreen: () => void;
  onPictureInPicture: () => void;
  showTimeOnHover?: boolean;
}

export function VideoControls({
  isPlaying,
  isMuted,
  currentTime,
  duration,
  buffered,
  showControls,
  isLoading,
  onPlayPause,
  onMute,
  onSeek,
  onFullscreen,
  onPictureInPicture,
  showTimeOnHover = true,
}: VideoControlsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = clickX / rect.width;
    const newTime = progress * duration;
    
    onSeek(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleProgressClick(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`absolute inset-0 transition-opacity duration-200 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent h-24 pointer-events-none" />
      
      {/* Main controls container */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Progress bar */}
        <div 
          className="relative mb-3 group cursor-pointer"
          onMouseEnter={() => showTimeOnHover && setShowTime(true)}
          onMouseLeave={() => showTimeOnHover && setShowTime(false)}
        >
          <div 
            ref={progressRef}
            className="w-full h-1 bg-white/30 rounded-full group-hover:h-1.5 transition-all duration-200"
            onClick={handleProgressClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Buffer bar */}
            <div 
              className="absolute top-0 left-0 h-full bg-white/50 rounded-full transition-all duration-200"
              style={{ width: `${buffered}%` }}
            />
            
            {/* Progress bar */}
            <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
            
            {/* Progress thumb */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              style={{ left: `${progress}%`, marginLeft: '-6px' }}
            />
          </div>
          
          {/* Time display on hover */}
          {showTime && showTimeOnHover && (
            <div className="absolute -top-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayPause();
              }}
              className="text-white hover:text-gray-300 transition-colors p-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-muted/30 border-t-foreground rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* Volume */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMute();
              }}
              className="text-white hover:text-gray-300 transition-colors p-1"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            {/* Time display (always visible on desktop) */}
            {!showTimeOnHover && (
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Picture in Picture */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPictureInPicture();
              }}
              className="text-white hover:text-gray-300 transition-colors p-1"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFullscreen();
              }}
              className="text-white hover:text-gray-300 transition-colors p-1"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
