import type { StreamClient } from 'getstream';
import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import { CompleteTip, ClassicPrediction } from '@/types/tip';
import { BetPost } from '@/types/bet';
import { CreateOpinionData } from '@/types/opinion';

/**
 * Activity data structure for GetStream
 */
interface StreamActivityData {
  id: string;
  verb?: string;
  object?: string;
  [key: string]: unknown;
}

/**
 * Feed options for GetStream queries
 */
interface FeedGetOptions {
  limit: number;
  enrich: boolean;
  withOwnReactions: boolean;
  withReactionCounts: boolean;
  withRecentReactions: boolean;
  id_lt?: string;
}

/**
 * Feed response structure
 */
interface FeedResponse {
  results: StreamActivityData[];
  next?: string;
}

/**
 * User profile data for opinion activities
 */
interface UserProfile {
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

/**
 * Unified GetStream service - handles all activity posting and retrieval
 * Replaces: tipService.ts, opinionService.ts, userPostsService.ts
 */
export class StreamService {
  /**
   * Core function to post any activity to a GetStream feed
   * @param client - GetStream client from useGetStreamClient hook
   */
  static async postActivity(
    client: StreamClient,
    activity: StreamActivityData,
    feedType: 'user' | 'premium_tips',
    userId: string
  ): Promise<void> {
    try {
      logger.info('Posting activity to GetStream', { feedType, userId, activityId: activity.id });
      
      const feed = client.feed(feedType, userId);
      
      // Ensure required fields for GetStream
      const activityWithRequiredFields = {
        ...activity,
        actor: userId,
        verb: activity.verb || 'post',
        object: activity.object || activity.id,
        to: [`timeline:${userId}`]
      };
      
      await feed.addActivity(activityWithRequiredFields);

      logger.info('Activity posted to GetStream feed successfully', { feedType, userId, activityId: activity.id });
    } catch (error) {
      logger.error('Failed to post activity to GetStream', error);
      throw error;
    }
  }

  /**
   * Create and post a tip activity
   * @param client - GetStream client from useGetStreamClient hook
   */
  static async createTipActivity(
    client: StreamClient,
    tipData: CompleteTip,
    visibility: 'public' | 'premium',
    userId: string
  ): Promise<void> {
    try {
      const activity: StreamActivityData = {
        id: tipData.selectionId || this.generateTipId(),
        ...tipData,
      };
      
      if (visibility === 'public') {
        await this.postActivity(client, activity, 'user', userId);
        logger.info('Tip published to public user feed', { userId, selectionId: tipData.selectionId });
      }
      
      if (visibility === 'premium') {
        await this.postActivity(client, activity, 'premium_tips', userId);
        logger.info('Tip published to premium tips feed', { userId, selectionId: tipData.selectionId });
      }
    } catch (error) {
      logger.error('Failed to create tip activity', error);
      throw error;
    }
  }

  /**
   * Create and post a bet activity
   * @param client - GetStream client from useGetStreamClient hook
   */
  static async createBetActivity(
    client: StreamClient,
    betData: BetPost,
    userId: string
  ): Promise<void> {
    try {
      const activity: StreamActivityData = {
        id: betData.selectionId || this.generateBetId(),
        ...betData,
      };
      await this.postActivity(client, activity, 'user', userId);
      logger.info('Bet published to public user feed', { userId, selectionId: betData.selectionId });
    } catch (error) {
      logger.error('Failed to create bet activity', error);
      throw error;
    }
  }

  /**
   * Create and post an opinion
   * @param client - GetStream client from useGetStreamClient hook
   */
  static async createOpinion(
    client: StreamClient,
    opinionData: CreateOpinionData,
    userId: string,
    userProfile?: UserProfile,
    isPremiumTip: boolean = false
  ): Promise<string> {
    try {
      // Generate unique ID for the opinion
      const opinionId = `opinion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const activity: StreamActivityData = {
        id: opinionId,
        verb: 'opinion',
        object: opinionId,
        content: opinionData.content,
        match: opinionData.match,
        time: new Date().toISOString(),
        isPremium: isPremiumTip,
        user: {
          id: userId,
          username: userProfile?.username || 'user',
          first_name: userProfile?.first_name || '',
          last_name: userProfile?.last_name || '',
          avatar_url: userProfile?.avatar_url || ''
        }
      };

      const feedType = isPremiumTip ? 'premium_tips' : 'user';
      await this.postActivity(client, activity, feedType, userId);
      
      logger.info('Opinion posted successfully', { 
        userId, 
        opinionId,
        matchId: opinionData.matchId,
        contentLength: opinionData.content.length
      });
      
      return opinionId;
    } catch (error) {
      logger.error('Failed to create opinion', error);
      throw new Error('Failed to post opinion');
    }
  }

  /**
   * Create and post a classic prediction
   * @param client - GetStream client from useGetStreamClient hook
   */
  static async createClassicPrediction(
    client: StreamClient,
    predictionData: ClassicPrediction,
    userId: string
  ): Promise<void> {
    try {
      const activity: StreamActivityData = {
        id: this.generateTipId(),
        ...predictionData,
      };
      
      await this.postActivity(client, activity, 'user', userId);
      logger.info('Classic prediction created', { userId, predictionId: activity.id });
    } catch (error) {
      logger.error('Failed to create classic prediction', error);
      throw error;
    }
  }

  /**
   * Vote on an opinion (upvote or downvote)
   * @param client - GetStream client from useGetStreamClient hook
   */
  static async voteOnOpinion(
    client: StreamClient,
    opinionId: string,
    voteType: 'upvote' | 'downvote',
    userId: string
  ): Promise<void> {
    try {
      await client.reactions.add(voteType, opinionId, {}, { userId });
      
      logger.info('Vote added to opinion', { 
        opinionId, 
        voteType, 
        userId 
      });
    } catch (error) {
      logger.error('Failed to vote on opinion', error);
      throw new Error('Failed to vote on opinion');
    }
  }

  /**
   * Remove a vote from an opinion
   * @param client - GetStream client from useGetStreamClient hook
   */
  static async removeVoteFromOpinion(
    client: StreamClient,
    reactionId: string,
    userId: string
  ): Promise<void> {
    try {
      await client.reactions.delete(reactionId);
      
      logger.info('Vote removed from opinion', { 
        reactionId, 
        userId 
      });
    } catch (error) {
      logger.error('Failed to remove vote from opinion', error);
      throw new Error('Failed to remove vote from opinion');
    }
  }

  /**
   * Get user timeline feed with enrichment
   * @param client - GetStream client from useGetStreamClient hook
   * @param userId - User ID
   * @param limit - Number of activities to fetch
   * @param offset - Activity ID to fetch older activities (for pagination)
   */
  static async getTimelineFeed(
    client: StreamClient, 
    userId: string, 
    limit: number = 10,
    offset?: string
  ): Promise<{ activities: StreamActivityData[], hasMore: boolean }> {
    try {
      const timeline = client.feed('timeline', userId);
      
      const params: FeedGetOptions = {
        limit,
        enrich: true,
        withOwnReactions: true,
        withReactionCounts: true,
        withRecentReactions: false,
      };

      // Add pagination parameter if offset provided
      if (offset) {
        params.id_lt = offset;
      }
      
      const response = await timeline.get(params) as FeedResponse;
      
      return {
        activities: response.results,
        hasMore: response.results.length === limit
      };
    } catch (error) {
      logger.error('Failed to get timeline feed', error);
      throw error;
    }
  }

  /**
   * Get filtered timeline feed by filter_tags (server-side filtering)
   * @param client - GetStream client from useGetStreamClient hook
   * @param userId - User ID
   * @param filterTags - Array of filter tags (e.g., ["match:abc123"] or ["home_team:x", "away_team:x"])
   * @param limit - Number of activities to fetch
   * @param offset - Activity ID for pagination
   */
  static async getFilteredTimelineFeed(
    client: StreamClient, 
    userId: string, 
    filterTags: string[],
    limit: number = 25,
    offset?: string
  ): Promise<{ activities: StreamActivityData[], hasMore: boolean }> {
    try {
      const timeline = client.feed('timeline', userId);
      
      // GetStream v3 syntax: filter_tags expects a simple array of strings
      // Multiple tags in the array create an OR condition
      const params: any = {
        limit,
        enrich: true,
        withOwnReactions: true,
        withReactionCounts: true,
        withRecentReactions: false,
        filter: {
          filter_tags: filterTags
        }
      };

      // Add pagination parameter if offset provided
      if (offset) {
        params.id_lt = offset;
      }
      
      logger.debug('Fetching filtered timeline feed', { userId, filterTags, limit });
      
      const response = await timeline.get(params) as FeedResponse;
      
      logger.debug('Filtered timeline feed response', { 
        activitiesCount: response.results.length,
        hasMore: response.results.length === limit
      });
      
      return {
        activities: response.results,
        hasMore: response.results.length === limit
      };
    } catch (error) {
      logger.error('Failed to get filtered timeline feed', error);
      throw error;
    }
  }

  /**
   * Get user feed - posts created BY the user (with pagination support)
   * @param client - GetStream client from useGetStreamClient hook
   */
  static async getUserFeed(
    client: StreamClient, 
    userId: string, 
    limit: number = 25,
    idLt?: string
  ): Promise<{ results: StreamActivityData[]; next?: string }> {
    try {
      const userFeed = client.feed('user', userId);
      
      const options: FeedGetOptions = {
        limit,
        enrich: true,
        withOwnReactions: true,
        withReactionCounts: true,
        withRecentReactions: false,
      };
      
      // Add cursor for pagination
      if (idLt) {
        options.id_lt = idLt;
      }
      
      const response = await userFeed.get(options) as FeedResponse;
      
      // Safely access results array
      const results = response?.results || [];
      
      logger.debug('User feed response', { 
        userId, 
        activitiesCount: results.length,
        hasMore: results.length === limit
      });
      
      // Return results and next cursor (last activity id)
      const lastActivity = results[results.length - 1];
      return {
        results,
        next: results.length === limit ? lastActivity?.id : undefined
      };
    } catch (error) {
      logger.error('Failed to get user feed', error);
      // Return empty results on error instead of throwing
      return { results: [], next: undefined };
    }
  }

  /**
   * Get activity by ID from GetStream
   * @param client - GetStream client from useGetStreamClient hook
   */
  static async getActivityById(client: StreamClient, activityId: string): Promise<StreamActivityData | null> {
    try {
      logger.info('Fetching activity by ID from GetStream', { activityId });
      
      const response = await client.getActivities({
        ids: [activityId],
      });
      
      const results = response.results as StreamActivityData[];
      return results[0] || null;
    } catch (error) {
      logger.error('Failed to get activity by ID', error);
      throw error;
    }
  }

  /**
   * Get user posts using the new get-user-posts edge function
   * Returns posts with count and pagination support
   */
  static async getUserPosts(userId: string): Promise<{
    posts: StreamActivityData[];
    count: number;
    next?: string;
  }> {
    try {
      logger.debug('getUserPosts - userId:', userId);
      
      const { data, error } = await supabase.functions.invoke('get-user-posts', {
        body: { userId }
      });
      
      if (error) {
        logger.error('Supabase function error:', error);
        throw new Error(`Failed to get user posts: ${error.message}`);
      }
      
      logger.debug('getUserPosts - response:', { 
        postsCount: data.count,
        hasNext: !!data.next 
      });
      
      return {
        posts: data.posts || [],
        count: data.count || 0,
        next: data.next
      };
    } catch (error) {
      logger.error('Error in getUserPosts:', error);
      throw error;
    }
  }

  /**
   * Generate unique tip ID
   */
  static generateTipId(): string {
    return `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique bet ID
   */
  static generateBetId(): string {
    return `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Legacy function exports for backward compatibility
export const postActivity = StreamService.postActivity.bind(StreamService);
export const createTipActivity = StreamService.createTipActivity.bind(StreamService);
export const createBetActivity = StreamService.createBetActivity.bind(StreamService);
export const createOpinion = StreamService.createOpinion.bind(StreamService);
export const createClassicPrediction = StreamService.createClassicPrediction.bind(StreamService);
export const voteOnOpinion = StreamService.voteOnOpinion.bind(StreamService);
export const removeVoteFromOpinion = StreamService.removeVoteFromOpinion.bind(StreamService);
export const getTimelineFeed = StreamService.getTimelineFeed.bind(StreamService);
export const getActivityById = StreamService.getActivityById.bind(StreamService);
export const getUserPosts = StreamService.getUserPosts.bind(StreamService);
export const generateTipId = StreamService.generateTipId.bind(StreamService);
export const generateBetId = StreamService.generateBetId.bind(StreamService);
export const postToUserFeed = StreamService.postActivity.bind(StreamService);
