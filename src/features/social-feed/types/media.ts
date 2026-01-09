/**
 * Media types for social feed posts
 * Aligned with src/types/core/media.ts
 */

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  alt?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

export interface MediaGridProps {
  media: MediaItem[];
  className?: string;
  autoplay?: boolean;
}