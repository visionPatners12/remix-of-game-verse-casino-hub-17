import React from 'react';
import { logger } from '@/utils/logger';

// Export all post components
export { BasePost } from './base/BasePost';
export type { BasePostProps, PostComponentFactory, PostTypeMapping } from './base/BasePostProps';

// Export all post card components
export { SimplePostCard } from './cards/SimplePostCard';
export { TipPostCard } from './cards/TipPostCard';
export { BetPostCard } from './cards/BetPostCard';
export { OpinionPostCard } from './cards/OpinionPostCard';

// Post factory function
import type { BasePostProps } from './base/BasePostProps';
import { SimplePostCard } from './cards/SimplePostCard';
import { TipPostCard } from './cards/TipPostCard';
import { BetPostCard } from './cards/BetPostCard';
import { OpinionPostCard } from './cards/OpinionPostCard';
import { PolymarketPredictionPostComponent } from '@/features/posts/components/types/PolymarketPredictionPostComponent';

// KISS: Simple object mapping instead of switch statement
const POST_COMPONENTS: Record<string, React.ComponentType<BasePostProps>> = {
  simple: SimplePostCard,
  prediction: TipPostCard,
  bet: BetPostCard,
  opinion: OpinionPostCard,
  polymarket_prediction: PolymarketPredictionPostComponent as any
};

/**
 * Factory function to create the appropriate post component based on post type
 * KISS: Uses simple object mapping
 */
export function createPostComponent(props: BasePostProps): JSX.Element {
  const { post } = props;

  try {
    const Component = POST_COMPONENTS[post.type] || SimplePostCard;
    return React.createElement(Component, props);
  } catch (error) {
    logger.error('[createPostComponent] Error rendering post:', error, { postId: post.id, type: post.type });
    
    return React.createElement('div', { 
      className: 'p-4 border border-destructive rounded-lg bg-destructive/5 mx-4 my-2' 
    },
      React.createElement('p', { className: 'text-destructive text-sm font-medium' }, 
        `❌ Error displaying post (${post.type})`
      ),
      React.createElement('p', { className: 'text-xs text-muted-foreground mt-1' },
        `Post ID: ${post.id.slice(0, 8)}...`
      )
    );
  }
}
