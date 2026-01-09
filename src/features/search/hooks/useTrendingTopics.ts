import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { TrendingService } from '../services/trendingService';
import type { TrendingTopic } from '../types';

interface UseTrendingTopicsOptions {
  category?: TrendingTopic['category'];
  maxResults?: number;
  minPosts?: number;
}

// Query keys centralisées
export const trendingTopicsKeys = {
  all: ['trending-topics'] as const,
  list: (options: UseTrendingTopicsOptions) => 
    [...trendingTopicsKeys.all, options] as const,
};

export function useTrendingTopics(options: UseTrendingTopicsOptions = {}) {
  const { category, maxResults = 5, minPosts = 1 } = options;
  
  const queryOptions = useMemo(() => ({ 
    limit: maxResults, 
    category, 
    minPosts 
  }), [maxResults, category, minPosts]);

  const { data: topics = [], isLoading, error } = useQuery({
    queryKey: trendingTopicsKeys.list(options),
    queryFn: () => TrendingService.getTrendingHashtags(queryOptions),
    staleTime: 1000 * 60 * 15,      // 15 minutes
    gcTime: 1000 * 60 * 30,          // 30 minutes en cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const getTopicsByCategory = useCallback((cat: TrendingTopic['category']) => {
    return topics.filter(topic => topic.category === cat);
  }, [topics]);

  return {
    topics,
    isLoading,
    error: error ? 'Failed to load trending topics' : null,
    getTopicsByCategory
  };
}
