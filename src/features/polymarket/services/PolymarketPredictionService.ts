import { supabase } from '@/integrations/supabase/client';
import type { PolymarketEvent, PolymarketMarket } from '@/features/polymarket/types/events';
import type { StreamClient } from 'getstream';
import { generatePolymarketHashtags } from '../utils/hashtagGenerator';

export interface CreatePolymarketPredictionInput {
  userId: string;
  market: PolymarketMarket;
  event: PolymarketEvent;
  outcome: 'Yes' | 'No' | string;
  odds: number;
  analysis?: string;
  confidence: number;
  isPremium?: boolean;
}

export interface PolymarketPrediction {
  id: string;
  user_id: string;
  market_id: string;
  event_id?: string;
  clob_token_id?: string;
  event_title: string;
  event_image?: string;
  market_question?: string;
  outcome: string;
  odds: number;
  probability?: number;
  analysis?: string;
  confidence: number;
  category?: string;
  end_date?: string;
  status: 'pending' | 'won' | 'lost';
  is_won?: boolean;
  visibility: string;
  is_premium: boolean;
  hashtags?: string[];
  stream_activity_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Service for creating and managing Polymarket predictions
 */
export class PolymarketPredictionService {
  /**
   * Create a new Polymarket prediction and publish to GetStream
   */
  static async createPrediction(
    client: StreamClient,
    input: CreatePolymarketPredictionInput & {
      authorUsername?: string;
      authorFullName?: string;
      authorAvatar?: string | null;
    }
  ): Promise<{ predictionId: string; error?: string }> {
    const { userId, market, event, outcome, odds, analysis, confidence, isPremium, authorUsername, authorFullName, authorAvatar } = input;

    try {
      // Calculate probability from odds
      const probability = odds > 0 ? 1 / odds : null;
      
      // Generate hashtags from event
      const hashtags = generatePolymarketHashtags(event);
      
      // 1. Insert into social_post.polymarket_predictions
      // Determine the clob_token_id based on outcome
      const outcomeIndex = outcome.toLowerCase() === 'yes' ? 0 : 1;
      const clob_token_id = market.clobTokenIds?.[outcomeIndex] || null;
      
      const { data, error } = await supabase
        .schema('social_post' as any)
        .from('polymarket_predictions')
        .insert({
          user_id: userId,
          market_id: market.id,
          event_id: String(event.id),
          clob_token_id,
          event_title: event.title,
          event_image: event.icon || (event as any).image || null,
          market_question: market.question || event.title,
          outcome,
          odds,
          probability,
          analysis: analysis || null,
          confidence,
          category: event.category || null,
          end_date: market.endDate || event.endDate || null,
          is_premium: isPremium || false,
          visibility: 'public',
          status: 'pending',
          hashtags
        })
        .select('id')
        .single();

      if (error) {
        console.error('[PolymarketPredictionService] Supabase insert error:', error);
        return { predictionId: '', error: error.message };
      }

      const predictionId = data.id;

      // 2. Publish to GetStream (aligned with PostCreationService format)
      try {
        const feedType = isPremium ? 'premium_tips' : 'user';
        const feed = client.feed(feedType, userId);
        
        // Activity format aligned with PostCreationService
        // Note: using 'as any' to allow additional custom fields like PostCreationService does
        const activity = {
          verb: 'polymarket_predict',
          object: `polymarket_prediction:${predictionId}`,
          foreign_id: `polymarket_prediction:${predictionId}`,
          time: new Date().toISOString(),
          
          // Author metadata (consistent with simple_post format)
          authorId: userId,
          authorUsername: authorUsername || '',
          authorFullName: authorFullName || '',
          authorAvatar: authorAvatar || null,
          
          // Hashtags for filtering and display
          hashtags,
          
          // Prediction data
          polymarket_prediction: {
            id: predictionId,
            market_id: market.id,
            event_id: String(event.id),
            clob_token_id,
            event_title: event.title,
            event_image: event.icon || (event as any).image || null,
            market_question: market.question || event.title,
            outcome,
            odds,
            probability,
            analysis: analysis || null,
            confidence,
            category: event.category || null,
            end_date: market.endDate || event.endDate || null,
            status: 'pending',
            is_premium: isPremium || false
          },
          
          // Post type metadata
          postType: 'polymarket_prediction',
          polymarketPredictionId: predictionId,
          isPremium: isPremium || false,
          to: [`timeline:${userId}`]
        };

        const response = await feed.addActivity(activity as any);

        // 3. Update with stream_activity_id
        if (response.id) {
          await supabase
            .schema('social_post' as any)
            .from('polymarket_predictions')
            .update({ stream_activity_id: response.id })
            .eq('id', predictionId);
        }
      } catch (streamError) {
        console.error('[PolymarketPredictionService] GetStream error:', streamError);
        // Don't fail the whole operation if GetStream fails
        // The prediction is still saved in Supabase
      }

      return { predictionId };
    } catch (err) {
      console.error('[PolymarketPredictionService] Unexpected error:', err);
      return { predictionId: '', error: 'Une erreur inattendue est survenue' };
    }
  }

  /**
   * Get user's Polymarket predictions
   */
  static async getUserPredictions(userId: string): Promise<PolymarketPrediction[]> {
    try {
      const { data, error } = await supabase
        .schema('social_post' as any)
        .from('polymarket_predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[PolymarketPredictionService] Error fetching predictions:', error);
        return [];
      }

      return data as PolymarketPrediction[];
    } catch (err) {
      console.error('[PolymarketPredictionService] Unexpected error:', err);
      return [];
    }
  }

  /**
   * Update stream activity ID after publishing to GetStream
   */
  static async updateStreamActivityId(
    predictionId: string,
    streamActivityId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .schema('social_post' as any)
        .from('polymarket_predictions')
        .update({ stream_activity_id: streamActivityId })
        .eq('id', predictionId);

      if (error) {
        console.error('[PolymarketPredictionService] Error updating stream activity ID:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[PolymarketPredictionService] Unexpected error:', err);
      return false;
    }
  }
}
