import React from 'react';
import { Lock } from 'lucide-react';
import { BasePost } from '@/features/social-feed/components/posts/base/BasePost';
import { MediaGrid } from '@/features/social-feed/components/media/MediaGrid';
import type { PostComponentProps, SimplePost } from '@/types/posts';
import type { MediaItem } from '@/features/social-feed/types/media';

/**
 * Raw media item from post content (before transformation)
 */
interface RawMediaItem {
  id?: string;
  type?: string;
  url?: string;
  src?: string;
  alt?: string;
}

/**
 * Simple post component - KISS: Simplified with unified type system
 */
export function SimplePostComponent(props: PostComponentProps<SimplePost>) {
  const { post } = props;
  const content = post.simpleContent || { text: post.content, media: post.media || [] };
  // isPremium is part of FeedPost base type
  const isPremium = post.isPremium || false;
  
  // Transform media to MediaItem format - handle both old and new media formats
  const mediaItems: MediaItem[] = (content.media || [])
    .filter((item: RawMediaItem) => item && (item.url || item.src))
    .map((item: RawMediaItem, index: number): MediaItem => ({
      id: item.id || `media-${post.id || 'unknown'}-${index}`,
      type: (item.type as 'image' | 'video' | 'gif') || 'image',
      url: item.url || item.src || '',
      alt: item.alt || `${post.author?.username || 'User'}'s media`,
    }));

  return (
    <BasePost {...props}>
      <div className="space-y-0">
        {/* Premium badge */}
        {isPremium && (
          <div className="flex items-center gap-2 pb-2">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-medium">
              <Lock className="h-3 w-3" />
              Premium
            </span>
          </div>
        )}
        
        {mediaItems.length > 0 && <MediaGrid media={mediaItems} />}
        
        {content.text && (
          <div className="text-foreground px-1">
            <p className="text-sm leading-relaxed">{content.text}</p>
          </div>
        )}
      </div>
    </BasePost>
  );
}

SimplePostComponent.displayName = 'SimplePostComponent';