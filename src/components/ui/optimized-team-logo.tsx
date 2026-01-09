import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AvatarFallback as ThemeAvatarFallback } from "@/components/ui/avatar-fallback";

interface OptimizedTeamLogoProps {
  src?: string | null;
  alt: string;
  teamName: string;
  variant?: "A" | "B";
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  lazy?: boolean;
}

const sizeClasses = {
  sm: 'w-7 h-7',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
};

/**
 * Optimized team logo component with:
 * - Lazy loading
 * - Error handling with fallback
 * - Immediate fallback for null/empty URLs
 */
export function OptimizedTeamLogo({ 
  src, 
  alt, 
  teamName,
  variant = "A",
  size = 'sm',
  className = '',
  lazy = true
}: OptimizedTeamLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  // Immediate fallback if no src
  const showFallback = !src || imageError;

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
        }
      },
      { rootMargin: '50px' }
    );

    const element = document.getElementById(`logo-${teamName}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [lazy, teamName]);

  return (
    <Avatar 
      id={`logo-${teamName}`}
      className={`${sizeClasses[size]} relative z-10 ${className}`}
    >
      {showFallback ? (
        <AvatarFallback asChild>
          <ThemeAvatarFallback 
            name={teamName}
            variant="team"
            size={size}
          />
        </AvatarFallback>
      ) : shouldLoad ? (
        <>
          <AvatarImage 
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <AvatarFallback asChild>
            <ThemeAvatarFallback 
              name={teamName}
              variant="team"
              size={size}
            />
          </AvatarFallback>
        </>
      ) : (
        <AvatarFallback asChild>
          <ThemeAvatarFallback 
            name={teamName}
            variant="team"
            size={size}
          />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
