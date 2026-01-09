import { z } from 'zod';

/**
 * Media Item Schema - Image/Video attached to posts
 */
export const MediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video', 'gif']),
  url: z.string(),
  alt: z.string().default(''),
  thumbnail: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;

/**
 * Media Grid Props - Component props for displaying media
 */
export interface MediaGridProps {
  media: MediaItem[];
  className?: string;
  autoplay?: boolean;
}
