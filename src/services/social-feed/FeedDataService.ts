/**
 * Feed Data Service - Simple functions (KISS)
 * Transforms GetStream activities into FeedPost format
 */

import { logger } from '@/utils/logger';
import type { FeedPost } from '@/types/feed';
import { labelOf } from '@/utils/labels';
import { formatFullName, normalizeSelection } from '@/utils/feedHelpers';
import type { 
  StreamActivity, 
  StreamUserData, 
  StreamSelectionData,
  StreamReactionCounts, 
  StreamOwnReactions, 
  StreamLatestReactions 
} from '@/types/stream';
import { extractValidUserData } from '@/types/stream';

// ============= Private Helpers =============

function extractUserData(activity: StreamActivity): StreamUserData {
  return extractValidUserData(activity);
}

function createAuthor(userData: StreamUserData) {
  return {
    id: userData.id || userData.username,
    username: userData.username || 'user',
    fullName: formatFullName(userData.first_name, userData.last_name, userData.username),
    avatar: userData.avatar || userData.avatar_url || '/placeholder.svg'
  };
}

function extractStreamReactionData(activity: StreamActivity): {
  reaction_counts?: StreamReactionCounts;
  own_reactions?: StreamOwnReactions;
  latest_reactions?: StreamLatestReactions;
} {
  return {
    reaction_counts: activity.reaction_counts,
    own_reactions: activity.own_reactions,
    latest_reactions: activity.latest_reactions
  };
}

function normalizeLeague(league: string | { name: string; slug: string; logo?: string } | undefined): string {
  return labelOf(league, '');
}

function normalizeSport(sport: string | { name: string; slug: string } | undefined): string {
  return labelOf(sport, '');
}

function transformStreamActivity(
  activity: StreamActivity, 
  type: 'prediction' | 'simple' | 'opinion' | 'bet', 
  getReactionCounts: (id: string) => FeedPost['reactions'],
  customFields: Record<string, unknown>
): FeedPost {
  const userData = extractUserData(activity);
  
  return {
    id: activity.id,
    type,
    author: createAuthor(userData),
    timestamp: activity.time,
    reactions: getReactionCounts(activity.id),
    activityId: activity.id,
    streamReactionData: extractStreamReactionData(activity),
    ...customFields
  };
}

// ============= Public Transform Functions =============

export function transformPredictions(
  predictions: StreamActivity[], 
  getReactionCounts: (id: string) => FeedPost['reactions']
): FeedPost[] {
  return predictions.map(activity => {
    const userData = extractUserData(activity);
    
    // DRY: Use shared normalizeSelection helper
    const selections = (activity.selections || []).map((sel: StreamSelectionData) => 
      normalizeSelection(sel, normalizeSport, normalizeLeague)
    );

    const match = {
      id: activity.match?.id || activity.match?.azuroId || '',
      gameId: activity.match?.azuroId || activity.match?.id || '',
      date: activity.match?.date || activity.match?.startsAt || new Date().toISOString(),
      homeId: activity.match?.homeTeamId || activity.match?.homeId || '',
      homeName: activity.match?.homeName || activity.match?.homeTeam || '',
      awayId: activity.match?.awayTeamId || activity.match?.awayId || '',
      awayName: activity.match?.awayName || activity.match?.awayTeam || '',
      league: normalizeLeague(activity.match?.league),
      leagueId: activity.match?.leagueId || activity.match?.league_id || '',
    };

    const predictionData = {
      id: activity.id,
      match,
      selections,
      analysis: activity.analysis,
      confidence: (activity.confidence || 3) * 20,
      bet_type: (activity.bet_type as 'simple' | 'combiné') || 'simple',
      hashtags: activity.hashtags || [],
      isPremium: activity.isPremium || false
    };
    
    return {
      id: activity.id,
      type: 'prediction' as const,
      author: createAuthor(userData),
      timestamp: activity.time,
      reactions: getReactionCounts(activity.id),
      activityId: activity.id,
      streamReactionData: extractStreamReactionData(activity),
      content: activity.analysis || '',
      tags: activity.hashtags || [],
      predictionContent: predictionData,
      prediction: predictionData
    };
  });
}

export function transformPosts(
  posts: StreamActivity[], 
  getReactionCounts: (id: string) => FeedPost['reactions']
): FeedPost[] {
  return posts.map(post => transformStreamActivity(
    post,
    'simple',
    getReactionCounts,
    {
      content: post.content,
      tags: post.hashtags || [],
      media: post.media || [],
      simplePost: post,
      isPremium: post.isPremium || false
    }
  ));
}

export function transformOpinions(
  opinions: StreamActivity[], 
  getReactionCounts: (id: string) => FeedPost['reactions']
): FeedPost[] {
  return opinions.map(opinion => transformStreamActivity(
    opinion,
    'opinion',
    getReactionCounts,
    {
      content: opinion.content,
      tags: opinion.hashtags || [],
      opinion
    }
  ));
}

export function transformBets(
  bets: StreamActivity[], 
  getReactionCounts: (id: string) => FeedPost['reactions']
): FeedPost[] {
  return bets
    .map(bet => {
      if (!bet.selections || bet.selections.length === 0) {
        logger.warn('[FeedDataService] Bet without selections:', bet.id);
        return null;
      }

      // DRY: Use shared normalizeSelection helper
      const normalizedSelections = bet.selections.map((sel: StreamSelectionData) =>
        normalizeSelection(sel, normalizeSport, normalizeLeague)
      );

      const betData = {
        selections: normalizedSelections,
        bet_type: (bet.bet_type as 'simple' | 'combiné') || 'simple',
        analysis: bet.analysis || '',
        betAmount: bet.betAmount || 0,
        currency: bet.currency || 'USDT',
        totalOdds: bet.totalOdds,
        potentialWin: bet.potentialWin,
      };

      return transformStreamActivity(
        bet,
        'bet',
        getReactionCounts,
        {
          content: bet.analysis || '',
          tags: bet.hashtags || [],
          bet: betData,
        }
      );
    })
    .filter((post): post is FeedPost => post !== null);
}

export function transformPolymarketPredictions(
  activities: StreamActivity[],
  getReactionCounts: (id: string) => FeedPost['reactions']
): FeedPost[] {
  return activities.map(activity => {
    const userData = extractUserData(activity);
    const polymarketPrediction = (activity as any).polymarket_prediction || {};
    
    return {
      id: activity.id,
      type: 'polymarket_prediction' as const,
      author: createAuthor(userData),
      timestamp: activity.time,
      reactions: getReactionCounts(activity.id),
      activityId: activity.id,
      streamReactionData: extractStreamReactionData(activity),
      content: polymarketPrediction.analysis || activity.content || '',
      tags: (activity as any).hashtags || [],
      polymarketPrediction: {
        event_title: polymarketPrediction.event_title,
        event_image: polymarketPrediction.event_image,
        market_id: polymarketPrediction.market_id,
        event_id: polymarketPrediction.event_id,
        clob_token_id: polymarketPrediction.clob_token_id,
        market_question: polymarketPrediction.market_question,
        outcome: polymarketPrediction.outcome,
        odds: polymarketPrediction.odds || 1,
        probability: polymarketPrediction.probability,
        analysis: polymarketPrediction.analysis,
        confidence: polymarketPrediction.confidence || 3,
        is_premium: (activity as any).isPremium || false,
        status: 'pending',
      },
      polymarketPredictionContent: polymarketPrediction,
      isPremium: (activity as any).isPremium || false,
    };
  });
}

export function combineAndSortPosts(postArrays: FeedPost[][]): FeedPost[] {
  return postArrays
    .flat()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function filterPostsById(posts: FeedPost[], focusedId: string | null): FeedPost[] {
  if (focusedId) {
    return posts.filter(post => post.id === focusedId);
  }
  return posts;
}

// Re-export for backward compatibility - use named exports directly instead
/** @deprecated Use named exports: transformPredictions, transformPosts, etc. */
export const FeedDataService = {
  transformPredictions,
  transformPosts,
  transformOpinions,
  transformBets,
  transformPolymarketPredictions,
  combineAndSortPosts,
  filterPostsById,
};
