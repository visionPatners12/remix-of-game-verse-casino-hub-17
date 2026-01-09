import React, { memo } from 'react';
import { Lock } from 'lucide-react';
import { BasePost } from '../base/BasePost';
import { MediaGrid } from '../../media/MediaGrid';
import type { BasePostProps } from '../base/BasePostProps';
import type { MediaItem } from '../../../types/media';

/**
 * Simple post card - memoized for performance
 */
export const SimplePostCard = memo(function SimplePostCard(props: BasePostProps) {
  const { post } = props;
  const isPremium = (post as any).isPremium || false;

  const mediaItems: MediaItem[] = post.media?.map((item, index) => ({
    id: item.id || `media-${index}`,
    type: item.type as 'image' | 'video',
    url: item.url,
    alt: item.alt || `${post.author?.username || 'User'}'s ${item.type}`,
  })) || [];

  return (
    <BasePost {...props}>
      <div className="space-y-0">
        {isPremium && (
          <div className="flex items-center gap-2 pb-2 px-1">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-medium">
              <Lock className="h-3 w-3" />
              Premium
            </span>
          </div>
        )}
        <MediaGrid media={mediaItems} />
        {post.content && (
          <div className="text-foreground px-1">
            <p className="text-sm leading-relaxed">{post.content}</p>
          </div>
        )}
      </div>
    </BasePost>
  );
});
