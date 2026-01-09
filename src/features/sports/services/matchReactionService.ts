import { socialClient } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";
import { formatRelativeTime } from '@/utils/formatters';
import type { Comment } from '@/features/social-feed/components/shared/CommentSection';

// Get likes count for a match
export async function getLikesCount(matchId: string): Promise<number> {
  const { count, error } = await socialClient
    .from('match_likes')
    .select('*', { count: 'exact', head: true })
    .eq('match_id', matchId);
  
  if (error) {
    console.error('Error fetching likes count:', error);
    return 0;
  }
  return count || 0;
}

// Get comments count for a match
export async function getCommentsCount(matchId: string): Promise<number> {
  const { count, error } = await socialClient
    .from('match_comments')
    .select('*', { count: 'exact', head: true })
    .eq('match_id', matchId)
    .eq('is_deleted', false);
  
  if (error) {
    console.error('Error fetching comments count:', error);
    return 0;
  }
  return count || 0;
}

// Check if user has liked a match
export async function getUserLikeStatus(matchId: string, userId: string): Promise<boolean> {
  const { data, error } = await socialClient
    .from('match_likes')
    .select('id')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .limit(1);
  
  if (error) {
    console.error('Error checking user like status:', error);
    return false;
  }
  return data && data.length > 0;
}

// Toggle like on a match
export async function toggleLike(matchId: string, userId: string): Promise<boolean> {
  // Check if already liked
  const { data: existingLikes } = await socialClient
    .from('match_likes')
    .select('id')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .limit(1);
  
  if (existingLikes && existingLikes.length > 0) {
    // Unlike - delete ALL likes for this user/match (handles duplicates)
    const { error } = await socialClient
      .from('match_likes')
      .delete()
      .eq('match_id', matchId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error unliking match:', error);
      throw error;
    }
    return false; // Now unliked
  } else {
    // Like
    const { error } = await socialClient
      .from('match_likes')
      .insert({ match_id: matchId, user_id: userId });
    
    if (error) {
      console.error('Error liking match:', error);
      throw error;
    }
    return true; // Now liked
  }
}

export interface GifData {
  url: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
}

// Add comment to a match
export async function addComment(
  matchId: string,
  userId: string,
  content: string,
  gifData?: GifData
): Promise<void> {
  const insertData: Record<string, unknown> = {
    match_id: matchId,
    user_id: userId,
    content
  };
  
  if (gifData) {
    insertData.gif_data = gifData;
  }

  const { error } = await socialClient
    .from('match_comments')
    .insert(insertData);
  
  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// Get comments for a match with user details (flat format)
export async function getComments(matchId: string): Promise<Comment[]> {
  const { data: comments, error } = await socialClient
    .from('match_comments')
    .select('id, user_id, content, created_at, gif_data')
    .eq('match_id', matchId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  
  if (!comments || comments.length === 0) {
    return [];
  }
  
  // Get user details for all comments
  const userIds = [...new Set(comments.map(c => c.user_id))];
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, first_name, last_name, avatar_url')
    .in('id', userIds);
  
  if (usersError) {
    console.error('Error fetching user details:', usersError);
    return [];
  }
  
  // Create user map for quick lookup
  const userMap = new Map(users?.map(u => [u.id, u]) || []);
  
  // Transform to flat format
  return comments.map(comment => {
    const user = userMap.get(comment.user_id);
    const username = user?.username || 'anonymous';
    const fullName = user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : username;
    
    // Parse gif_data if present
    const gifData = comment.gif_data ? {
      url: comment.gif_data.url,
      previewUrl: comment.gif_data.previewUrl,
      width: comment.gif_data.width,
      height: comment.gif_data.height,
      alt: comment.gif_data.alt,
    } : undefined;
    
    return {
      id: comment.id,
      username,
      fullName,
      displayUsername: username,
      avatar: user?.avatar_url,
      text: comment.content,
      timestamp: formatRelativeTime(comment.created_at),
      gif: gifData,
    };
  });
}

interface BatchReactionResult {
  [matchId: string]: {
    likes: number;
    comments: number;
    userLiked: boolean;
  };
}

/**
 * Batch load reactions for multiple matches using RPC
 * This replaces multiple individual calls with a single RPC call
 */
export async function batchLoadReactions(
  matchIds: string[],
  userId?: string
): Promise<BatchReactionResult> {
  if (matchIds.length === 0) return {};

  const { data, error } = await socialClient.rpc('rpc_batch_feed_reactions', {
    p_highlight_ids: [],
    p_match_ids: matchIds,
    p_user_id: userId || null,
  });

  if (error) {
    console.error('Error batch loading match reactions:', error);
    throw error;
  }

  return (data || []).reduce((acc: BatchReactionResult, r: { item_id: string; likes_count: number; comments_count: number; user_liked: boolean }) => {
    acc[r.item_id] = {
      likes: r.likes_count,
      comments: r.comments_count,
      userLiked: r.user_liked,
    };
    return acc;
  }, {} as BatchReactionResult);
}
