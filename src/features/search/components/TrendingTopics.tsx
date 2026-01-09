import React from 'react';
import { Button } from '@/ui';
import { TrendingUp, Hash, BarChart3 } from 'lucide-react';
import type { TrendingTopic } from '../types';
import { cn } from '@/lib/utils';

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  onTopicClick: (topic: TrendingTopic) => void;
  className?: string;
  maxResults?: number;
  showGrowth?: boolean;
  title?: string;
  isLoading?: boolean;
}

export const TrendingTopics = React.memo<TrendingTopicsProps>(({
  topics,
  onTopicClick,
  className,
  maxResults,
  showGrowth = true,
  title = "Trending for you",
  isLoading = false
}) => {
  const displayTopics = maxResults ? topics.slice(0, maxResults) : topics;

  const getCategoryColor = (category?: TrendingTopic['category']) => {
    switch (category) {
      case 'sports':
        return 'text-blue-500';
      case 'crypto':
        return 'text-orange-500';
      case 'betting':
        return 'text-green-500';
      default:
        return 'text-primary';
    }
  };

  const formatGrowth = (growth?: number) => {
    if (!growth) return null;
    const percentage = Math.round(growth * 100);
    return percentage > 0 ? `+${percentage}%` : `${percentage}%`;
  };

  if (displayTopics.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 py-3 px-4 border-b border-border">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground">{title}</h3>
        {isLoading && <span className="text-muted-foreground text-sm font-normal">Loading...</span>}
      </div>
      
      <div className="divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="px-4 py-3">
              <div className="h-4 bg-muted/50 rounded mb-1 animate-pulse" />
              <div className="h-3 bg-muted/30 rounded w-1/2 animate-pulse" />
            </div>
          ))
        ) : (
          displayTopics.map((topic, index) => (
            <button
              key={`${topic.text}-${index}`}
              onClick={() => onTopicClick(topic)}
              className="w-full text-left px-4 py-3 active:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-medium transition-colors truncate",
                    getCategoryColor(topic.category)
                  )}>
                    {topic.text.startsWith('#') ? (
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {topic.text.slice(1)}
                      </span>
                    ) : (
                      topic.text
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{topic.posts} posts</span>
                    {topic.category && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{topic.category}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {showGrowth && topic.growth && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                    <BarChart3 className="h-3 w-3" />
                    <span className={cn(
                      topic.growth > 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {formatGrowth(topic.growth)}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
});

TrendingTopics.displayName = 'TrendingTopics';