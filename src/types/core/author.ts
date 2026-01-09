import { z } from 'zod';

/**
 * Author Schema - User who created a post
 * Single source of truth for author information
 */
export const AuthorSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  avatar: z.string().optional(),
});

export type Author = z.infer<typeof AuthorSchema>;
