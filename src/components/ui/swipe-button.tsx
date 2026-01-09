import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface SwipeButtonProps {
  onSwipeComplete?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SwipeButton({ 
  onSwipeComplete, 
  children, 
  className,
  disabled = false 
}: SwipeButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [slidePosition, setSlidePosition] = useState(0);
  const buttonRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleStart = (clientX: number) => {
    if (disabled) return;
    setIsPressed(true);
    startX.current = clientX;
    currentX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isPressed || disabled) return;
    
    currentX.current = clientX;
    const diff = currentX.current - startX.current;
    const buttonWidth = buttonRef.current?.offsetWidth || 0;
    const maxSlide = buttonWidth - 60; // 60px for the thumb width
    
    const newPosition = Math.max(0, Math.min(diff, maxSlide));
    setSlidePosition(newPosition);

    // Complete swipe when reaching the end
    if (newPosition >= maxSlide * 0.9) {
      handleComplete();
    }
  };

  const handleEnd = () => {
    if (disabled) return;
    setIsPressed(false);
    setSlidePosition(0);
  };

  const handleComplete = () => {
    setIsPressed(false);
    setSlidePosition(0);
    onSwipeComplete?.();
  };

  return (
    <div
      ref={buttonRef}
      className={cn(
        "relative h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg overflow-hidden cursor-pointer select-none border-2 border-amber-400/50 shadow-lg",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {/* Background text with arrow indication */}
      <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
        <span className="mr-2">{children}</span>
        <span className="text-white/80 text-base animate-pulse">→ →</span>
      </div>
      
      {/* Sliding thumb */}
      <div 
        className="absolute left-1 top-1 bottom-1 w-14 bg-white rounded-md flex items-center justify-center transition-transform duration-200 ease-out shadow-xl z-20"
        style={{ transform: `translateX(${slidePosition}px)` }}
      >
        <Zap className="h-6 w-6 text-amber-500 drop-shadow-sm z-30 relative" fill="currentColor" />
      </div>
      
      {/* Progress overlay */}
      <div 
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-600 to-orange-700 transition-all duration-200"
        style={{ width: `${slidePosition + 60}px` }}
      />
    </div>
  );
}