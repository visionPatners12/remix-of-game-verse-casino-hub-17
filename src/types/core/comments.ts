import { z } from 'zod';

/**
 * Gif Schema - GIF attachment in comments
 */
export const GifSchema = z.object({
  url: z.string(),
  previewUrl: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  alt: z.string().optional(),
});

export type GifData = z.infer<typeof GifSchema>;

/**
 * Comment Schema - Comment on a post
 */
export const CommentSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  displayUsername: z.string(),
  avatar: z.string().optional(),
  text: z.string(),
  timestamp: z.string(),
  gif: GifSchema.optional(),
});

export type Comment = z.infer<typeof CommentSchema>;
