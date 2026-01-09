import { useQuery } from '@tanstack/react-query';
import { TrendingService } from '@/features/search/services/trendingService';

interface TrendingHashtag {
  id: string;
  hashtag: string;
  posts: number;
  growth: string;
  category: 'match' | 'team' | 'player' | 'league';
}

function parsePostCount(posts: string): number {
  const num = parseFloat(posts.replace(/[KM]/g, ''));
  if (posts.includes('M')) return Math.round(num * 1000000);
  if (posts.includes('K')) return Math.round(num * 1000);
  return Math.round(num);
}

function categorizeForView(hashtag: string): 'match' | 'team' | 'player' | 'league' {
  const lower = hashtag.toLowerCase();
  if (lower.includes('vs') || lower.includes('match')) return 'match';
  if (lower.includes('league') || lower.includes('champions')) return 'league';
  if (lower.match(/[a-z]+vs[a-z]+/i)) return 'match';
  const playerNames = ['mbappe', 'messi', 'ronaldo', 'neymar', 'haaland', 'vinicius'];
  if (playerNames.some(name => lower.includes(name))) return 'player';
  return 'team';
}

/**
 * Hook spécifique pour le TrendingView du Dashboard
 * Transforme les données du service en format TrendingView
 */
export function useTrendingHashtags(limit: number = 10) {
  const { data: hashtags = [], isLoading } = useQuery({
    queryKey: ['trending-hashtags', limit],
    queryFn: async () => {
      const data = await TrendingService.getTrendingHashtags({ 
        limit, 
        category: 'sports'
      });
      
      return data.map((topic, index) => ({
        id: `${index + 1}`,
        hashtag: topic.text,
        posts: parsePostCount(topic.posts),
        growth: topic.growth ? `+${(topic.growth * 100).toFixed(0)}%` : '+0%',
        category: categorizeForView(topic.text)
      }));
    },
    staleTime: 1000 * 60 * 15,      // 15 minutes
    gcTime: 1000 * 60 * 30,          // 30 minutes
    refetchOnWindowFocus: false,
  });

  return { hashtags, isLoading };
}
