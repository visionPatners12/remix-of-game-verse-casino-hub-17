import { socialClient } from '@/integrations/supabase/client';
import type { TrendingTopic } from '../types';

/**
 * Service pour récupérer les hashtags trending depuis social_post.hashtag_counts_24h
 */
export class TrendingService {
  /**
   * Catégorise automatiquement un hashtag selon son contenu
   */
  private static categorizeHashtag(hashtag: string): TrendingTopic['category'] {
    const lower = hashtag.toLowerCase();
    
    // Mots-clés sport
    const sportKeywords = ['match', 'goal', 'league', 'team', 'player', 'football', 'soccer', 'psg', 'mbappe', 'champions', 'premier', 'barcelona', 'tennis', 'basketball', 'nba', 'formula', 'f1'];
    // Mots-clés crypto
    const cryptoKeywords = ['crypto', 'bitcoin', 'eth', 'btc', 'nft', 'blockchain', 'defi', 'web3'];
    // Mots-clés betting
    const bettingKeywords = ['bet', 'odds', 'tip', 'prediction', 'stake', 'parlay'];
    
    if (sportKeywords.some(kw => lower.includes(kw))) return 'sports';
    if (cryptoKeywords.some(kw => lower.includes(kw))) return 'crypto';
    if (bettingKeywords.some(kw => lower.includes(kw))) return 'betting';
    
    return 'general';
  }

  /**
   * Formate le nombre de posts (ex: 1500 -> "1.5K")
   */
  private static formatPostCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }

  /**
   * Récupère les hashtags trending depuis la vue Supabase
   */
  static async getTrendingHashtags(options: {
    limit?: number;
    category?: TrendingTopic['category'];
    minPosts?: number;
  } = {}): Promise<TrendingTopic[]> {
    const { limit = 10, category, minPosts = 1 } = options;

    try {
      // Query la vue avec socialClient
      let query = socialClient
        .from('hashtag_counts_24h')
        .select('hashtag, nb_posts_24h')
        .gte('nb_posts_24h', minPosts)
        .order('nb_posts_24h', { ascending: false })
        .limit(limit * 3); // Fetch plus pour filtrer ensuite

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching trending hashtags:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Transformer les données
      let trending: TrendingTopic[] = data.map(item => ({
        text: item.hashtag?.startsWith('#') ? item.hashtag : `#${item.hashtag}`,
        posts: this.formatPostCount(Number(item.nb_posts_24h || 0)),
        category: this.categorizeHashtag(item.hashtag || ''),
        growth: undefined // On pourrait calculer si on a l'historique
      }));

      // Filtrer par catégorie si demandé
      if (category) {
        trending = trending.filter(t => t.category === category);
      }

      // Limiter au nombre demandé
      return trending.slice(0, limit);

    } catch (error) {
      console.error('Unexpected error in getTrendingHashtags:', error);
      return [];
    }
  }

}
