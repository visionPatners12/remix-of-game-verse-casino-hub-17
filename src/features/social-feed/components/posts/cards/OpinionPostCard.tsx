import React, { memo, useEffect } from 'react';
import { BasePost } from '../base/BasePost';
import { Button } from '@/ui';
import { ThumbsUp, ThumbsDown } from '@/ui/icons';
import { useOpinionVoting } from '@/hooks/useOpinionVoting';
import type { BasePostProps } from '../base/BasePostProps';

interface OpinionStreamData {
  id?: string;
  reaction_counts?: {
    upvote?: number;
    downvote?: number;
  };
  own_reactions?: {
    upvote?: unknown[];
    downvote?: unknown[];
  };
}

/**
 * Opinion post card - memoized for performance
 */
export const OpinionPostCard = memo(function OpinionPostCard(props: BasePostProps) {
  const { post } = props;
  const opinion = post.opinion as OpinionStreamData | undefined;
  const { initializeVoteState, vote, voteStates, isVoting } = useOpinionVoting();

  useEffect(() => {
    if (!opinion?.id) return;
    
    const upvotes = opinion.reaction_counts?.upvote || 0;
    const downvotes = opinion.reaction_counts?.downvote || 0;
    const userUpvoted = (opinion.own_reactions?.upvote?.length || 0) > 0;
    const userDownvoted = (opinion.own_reactions?.downvote?.length || 0) > 0;
    const userVote = userUpvoted ? 'upvote' : userDownvoted ? 'downvote' : null;
    
    initializeVoteState(opinion.id, { userVote, upvotes, downvotes });
  }, [opinion?.id, opinion?.reaction_counts?.upvote, opinion?.reaction_counts?.downvote, opinion?.own_reactions?.upvote?.length, opinion?.own_reactions?.downvote?.length, initializeVoteState]);

  const voteState = voteStates[opinion?.id];

  if (!opinion) {
    return (
      <BasePost {...props}>
        <div className="text-sm text-foreground">{post.content}</div>
      </BasePost>
    );
  }

  return (
    <BasePost {...props}>
      <div className="space-y-3">
        <div className="py-1">
          <p className="text-foreground leading-relaxed text-lg font-medium">{post.content}</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant={voteState?.userVote === 'upvote' ? 'default' : 'outline'}
            size="sm"
            onClick={() => opinion && vote(opinion.id, 'upvote')}
            disabled={!opinion || isVoting[opinion?.id]}
            className="h-9 px-3 text-sm font-medium transition-all duration-300"
          >
            <ThumbsUp className="w-3.5 h-3.5 mr-1" />
            <span>{voteState?.upvotes || 0}</span>
          </Button>
          
          <Button
            variant={voteState?.userVote === 'downvote' ? 'default' : 'outline'}
            size="sm"
            onClick={() => opinion && vote(opinion.id, 'downvote')}
            disabled={!opinion || isVoting[opinion?.id]}
            className="h-9 px-3 text-sm font-medium transition-all duration-300"
          >
            <ThumbsDown className="w-3.5 h-3.5 mr-1" />
            <span>{voteState?.downvotes || 0}</span>
          </Button>
        </div>
      </div>
    </BasePost>
  );
});
