import React, { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Si true, l'image sera chargée immédiatement (pour LCP) */
  priority?: boolean;
  /** Classe pour le placeholder skeleton */
  skeletonClassName?: string;
  /** Fallback image URL */
  fallback?: string;
  /** Aspect ratio pour le placeholder (ex: "16/9", "1/1") */
  aspectRatio?: string;
}

/**
 * Composant d'image optimisé avec:
 * - Lazy loading natif
 * - Skeleton placeholder
 * - Fallback sur erreur
 * - Fade-in animation
 * - Support des formats modernes (WebP, AVIF via srcSet)
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  skeletonClassName,
  fallback = '/placeholder.svg',
  aspectRatio,
  className,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer pour lazy loading amélioré
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Précharger 200px avant d'être visible
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const imageSrc = hasError ? fallback : src;
  const shouldRenderImage = isInView || priority;

  // Calculer le style pour l'aspect ratio
  const containerStyle: React.CSSProperties = {
    ...style,
    ...(aspectRatio && !height ? { aspectRatio } : {}),
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={containerStyle}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <Skeleton
          className={cn(
            'absolute inset-0 w-full h-full',
            skeletonClassName
          )}
        />
      )}

      {/* Image */}
      {shouldRenderImage && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
});

/**
 * Composant pour les images de fond optimisées
 */
interface OptimizedBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  fallback?: string;
  priority?: boolean;
}

export const OptimizedBackground = memo(function OptimizedBackground({
  src,
  fallback = '/placeholder.svg',
  priority = false,
  className,
  children,
  style,
  ...props
}: OptimizedBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(priority);

  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(true);
    };
    img.src = src;
  }, [src, isInView]);

  const imageSrc = hasError ? fallback : src;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-muted transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-90',
        className
      )}
      style={{
        ...style,
        ...(isLoaded ? { backgroundImage: `url(${imageSrc})` } : {}),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      {...props}
    >
      {children}
    </div>
  );
});

export default OptimizedImage;
