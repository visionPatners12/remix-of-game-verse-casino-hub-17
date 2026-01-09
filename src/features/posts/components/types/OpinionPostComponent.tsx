import React from 'react';
import { BasePost } from '@/features/social-feed/components/posts/base/BasePost';
import { Card } from '@/ui';
import type { PostComponentProps, OpinionPost } from '@/types/posts';
import { labelOf } from '@/utils/labels';

/**
 * Opinion post component - KISS: Simplified with unified type system
 */
export function OpinionPostComponent(props: PostComponentProps<OpinionPost>) {
  const { post } = props;
  const opinion = post.opinionContent;

  const getStanceColor = (stance?: string) => {
    switch (stance) {
      case 'for': return 'text-green-600';
      case 'against': return 'text-red-600';
      case 'neutral': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStanceLabel = (stance?: string) => {
    switch (stance) {
      case 'for': return 'Pour';
      case 'against': return 'Contre';
      case 'neutral': return 'Neutre';
      default: return null;
    }
  };

  return (
    <BasePost {...props}>
      <div className="space-y-3">
        {/* Opinion content */}
        {opinion && (
          <Card className="p-3">
            {/* Title or category */}
            {(opinion.title || opinion.category) && (
              <div className="mb-2">
                {opinion.title && (
                  <h4 className="text-sm font-semibold text-foreground">{opinion.title}</h4>
                )}
                {opinion.category && (
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {opinion.category}
                  </span>
                )}
              </div>
            )}

            {/* Match info */}
            {opinion.match && (
              <div className="mb-3 p-2 bg-muted/30 rounded">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {labelOf(opinion.match.league, 'Ligue inconnue')} • {labelOf(opinion.match.sport, 'Sport')}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {opinion.match.matchTitle}
                </div>
              </div>
            )}

            {/* Stance indicator */}
            {opinion.stance && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Position:
                </span>
                <span className={`text-xs font-medium ${getStanceColor(opinion.stance)}`}>
                  {getStanceLabel(opinion.stance)}
                </span>
              </div>
            )}
          </Card>
        )}

        {/* Main content */}
        {post.content && (
          <div className="text-foreground px-1">
            <p className="text-sm leading-relaxed">{post.content}</p>
          </div>
        )}
      </div>
    </BasePost>
  );
}

OpinionPostComponent.displayName = 'OpinionPostComponent';