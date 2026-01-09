import { socialClient, supabase } from '@/integrations/supabase/client';
import { formatRelativeTime } from '@/utils/formatters';

export interface GifData {
  url: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
}

interface BatchReactionResult {
  highlightId: string;
  likes: number;
  comments: number;
  userLiked: boolean;
}

/**
 * Batch load reactions for multiple highlights using RPC
 * This replaces multiple individual calls with a single RPC call
 */
export async function batchLoadReactions(
  highlightIds: string[],
  userId?: string
): Promise<BatchReactionResult[]> {
  if (highlightIds.length === 0) return [];

  const { data, error } = await socialClient.rpc('rpc_batch_feed_reactions', {
    p_highlight_ids: highlightIds,
    p_match_ids: [],
    p_user_id: userId || null,
  });

  if (error) throw error;

  return (data || []).map((r: { item_id: string; likes_count: number; comments_count: number; user_liked: boolean }) => ({
    highlightId: r.item_id,
    likes: r.likes_count,
    comments: r.comments_count,
    userLiked: r.user_liked,
  }));
}

/**
 * Get likes count for a highlight (kept for single-item use cases)
 */
export async function getLikesCount(highlightId: string): Promise<number> {
  const { count, error } = await socialClient
    .from('highlight_likes')
    .select('*', { count: 'exact', head: true })
    .eq('highlight_id', highlightId);

  if (error) throw error;
  return count || 0;
}

/**
 * Get comments count for a highlight (kept for single-item use cases)
 */
export async function getCommentsCount(highlightId: string): Promise<number> {
  const { count, error } = await socialClient
    .from('highlight_comments')
    .select('*', { count: 'exact', head: true })
    .eq('highlight_id', highlightId)
    .eq('is_deleted', false);

  if (error) throw error;
  return count || 0;
}

/**
 * Check if user has liked a highlight (kept for single-item use cases)
 */
export async function getUserLikeStatus(highlightId: string, userId: string): Promise<boolean> {
  const { data, error } = await socialClient
    .from('highlight_likes')
    .select('id')
    .eq('highlight_id', highlightId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Toggle like for a highlight
 */
export async function toggleLike(highlightId: string, userId: string): Promise<boolean> {
  // Check if already liked
  const isLiked = await getUserLikeStatus(highlightId, userId);

  if (isLiked) {
    // Unlike
    const { error } = await socialClient
      .from('highlight_likes')
      .delete()
      .eq('highlight_id', highlightId)
      .eq('user_id', userId);

    if (error) throw error;
    return false;
  } else {
    // Like
    const { error } = await socialClient
      .from('highlight_likes')
      .insert({ highlight_id: highlightId, user_id: userId });

    if (error) throw error;
    return true;
  }
}

/**
 * Add a comment to a highlight
 */
export async function addComment(
  highlightId: string,
  userId: string,
  content: string,
  gifData?: GifData
): Promise<void> {
  const insertData: Record<string, unknown> = {
    highlight_id: highlightId,
    user_id: userId,
    content: content.trim(),
  };
  
  if (gifData) {
    insertData.gif_data = gifData;
  }

  const { error } = await socialClient
    .from('highlight_comments')
    .insert(insertData);

  if (error) throw error;
}

/**
 * Get comments for a highlight with user details
 */
export async function getComments(highlightId: string): Promise<any[]> {
  const { data: comments, error } = await socialClient
    .from('highlight_comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      is_deleted,
      gif_data
    `)
    .eq('highlight_id', highlightId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!comments || comments.length === 0) return [];

  // Get unique user IDs
  const userIds = [...new Set(comments.map(c => c.user_id))];

  // Fetch user details from public schema
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, first_name, last_name, avatar_url')
    .in('id', userIds);

  if (usersError) throw usersError;

  // Create user map
  const userMap = new Map(users?.map(u => [u.id, u]) || []);

  // Transform comments to expected format
  return comments.map(comment => {
    const user = userMap.get(comment.user_id);
    const username = user?.username || 'Anonymous';
    
    // Parse gif_data if present
    const gifDataParsed = comment.gif_data ? {
      url: comment.gif_data.url,
      previewUrl: comment.gif_data.previewUrl,
      width: comment.gif_data.width,
      height: comment.gif_data.height,
      alt: comment.gif_data.alt,
    } : undefined;
    
    return {
      id: comment.id,
      username: username,
      fullName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || username,
      displayUsername: `@${username.toLowerCase()}`,
      avatar: user?.avatar_url,
      text: comment.content,
      timestamp: formatRelativeTime(comment.created_at),
      gif: gifDataParsed,
    };
  });
}
