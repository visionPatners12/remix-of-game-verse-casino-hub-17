import type { StreamClient } from 'getstream';
import { logger } from '@/utils/logger';
import { parseFullName } from '@/utils/feedHelpers';
import type { Author } from '@/types/feed';

/**
 * Add a like reaction to an activity
 * @param client - GetStream client instance
 * @param activityId - Activity ID to like
 * @param user - Author object with user info
 */
export async function addLike(client: StreamClient, activityId: string, user: Author) {
  logger.debug('Adding like for user:', user);
  
  const { firstName, lastName } = parseFullName(user.fullName);
  
  const likeData = {
    user_id: user.id,
    first_name: firstName || user.username,
    last_name: lastName,
    username: user.username,
    avatar_url: user.avatar || ''
  };
  
  logger.debug('Sending like data to GetStream:', likeData);
  
  try {
    const response = await client.reactions.add("like", activityId, likeData);
    logger.debug('Like added successfully:', response);
    return response;
  } catch (error) {
    logger.error('Failed to add like:', error);
    throw error;
  }
}

/**
 * Remove a like reaction from an activity
 * @param client - GetStream client instance
 * @param activityId - Activity ID to unlike
 * @param userId - User ID who liked the activity
 */
export async function removeLike(client: StreamClient, activityId: string, userId: string) {
  logger.debug('Removing like for user:', userId, 'on activity:', activityId);
  
  try {
    // DRY: Reuse getLikes instead of duplicating filter logic
    const likes = await getLikes(client, activityId);
    const userLike = likes.results?.find(r => r.user_id === userId);
    
    if (userLike) {
      await client.reactions.delete(userLike.id);
      logger.debug('Like removed successfully');
      return true;
    }
    
    logger.warn('No like found to remove');
    return false;
  } catch (error) {
    logger.error('Failed to remove like:', error);
    throw error;
  }
}

export interface CommentGif {
  url: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
}

/**
 * Add a comment reaction to an activity
 * @param client - GetStream client instance
 * @param activityId - Activity ID to comment on
 * @param text - Comment text
 * @param user - Author object with user info
 * @param gif - Optional GIF data
 */
export async function addComment(
  client: StreamClient, 
  activityId: string, 
  text: string, 
  user: Author,
  gif?: CommentGif
) {
  logger.debug('Adding comment for user:', user);
  logger.debug('Comment text:', text, 'Activity ID:', activityId, 'GIF:', gif);
  
  const { firstName, lastName } = parseFullName(user.fullName);
  
  const commentData: Record<string, unknown> = {
    user_id: user.id,
    first_name: firstName || user.username,
    last_name: lastName,
    username: user.username,
    avatar_url: user.avatar || '',
    text: text
  };
  
  // Add GIF data if present
  if (gif) {
    commentData.gif = {
      url: gif.url,
      previewUrl: gif.previewUrl,
      width: gif.width,
      height: gif.height,
      alt: gif.alt
    };
  }
  
  logger.debug('Sending comment data to GetStream:', commentData);
  
  try {
    const response = await client.reactions.add("comment", activityId, commentData);
    logger.debug('Comment added successfully:', response);
    return response;
  } catch (error) {
    logger.error('Failed to add comment:', error);
    throw error;
  }
}

export async function getActivityReactions(client: StreamClient, activityId: string) {
  return await client.reactions.filter({
    activity_id: activityId,
  });
}

export async function getLikes(client: StreamClient, activityId: string) {
  return await client.reactions.filter({
    activity_id: activityId,
    kind: "like",
    limit: 100,
  });
}

export async function getComments(client: StreamClient, activityId: string) {
  return await client.reactions.filter({
    activity_id: activityId,
    kind: "comment",
    limit: 100,
  });
}

export async function checkUserLike(client: StreamClient, activityId: string, userId: string) {
  return await client.reactions.filter({
    activity_id: activityId,
    kind: "like",
    user_id: userId,
    limit: 1,
  });
}
