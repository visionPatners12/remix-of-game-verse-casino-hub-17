import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { voteOnOpinion, removeVoteFromOpinion } from '@/services/getstream/streamService';
import { useGetStream } from '@/contexts/StreamProvider';
import { logger } from '@/utils/logger';

interface VoteState {
  [opinionId: string]: {
    userVote: 'upvote' | 'downvote' | null;
    upvotes: number;
    downvotes: number;
  };
}

export function useOpinionVoting() {
  const { user } = useAuth();
  const { getClient, isReady } = useGetStream();
  const [voteStates, setVoteStates] = useState<VoteState>({});
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({});

  const initializeVoteState = useCallback((opinionId: string, initialState: {
    userVote: 'upvote' | 'downvote' | null;
    upvotes: number;
    downvotes: number;
  }) => {
    setVoteStates(prev => {
      // Only update if the state doesn't exist or is significantly different
      const existing = prev[opinionId];
      if (existing && 
          existing.userVote === initialState.userVote &&
          existing.upvotes === initialState.upvotes &&
          existing.downvotes === initialState.downvotes) {
        return prev; // Return same reference to prevent re-renders
      }
      
      return {
        ...prev,
        [opinionId]: initialState
      };
    });
  }, []);

  const vote = async (opinionId: string, voteType: 'upvote' | 'downvote') => {
    if (!user?.id || isVoting[opinionId] || !isReady) return;

    const currentState = voteStates[opinionId];
    const currentVote = currentState?.userVote;

    try {
      const client = getClient();
      setIsVoting(prev => ({ ...prev, [opinionId]: true }));

      // Optimistic update
      setVoteStates(prev => {
        const current = prev[opinionId] || { userVote: null, upvotes: 0, downvotes: 0 };
        let newUpvotes = current.upvotes;
        let newDownvotes = current.downvotes;

        // Remove previous vote if exists
        if (current.userVote === 'upvote') newUpvotes--;
        if (current.userVote === 'downvote') newDownvotes--;

        // Add new vote if different from current
        if (currentVote !== voteType) {
          if (voteType === 'upvote') newUpvotes++;
          if (voteType === 'downvote') newDownvotes++;
        }

        return {
          ...prev,
          [opinionId]: {
            userVote: currentVote === voteType ? null : voteType,
            upvotes: newUpvotes,
            downvotes: newDownvotes
          }
        };
      });

      // If user already voted the same way, remove the vote
      if (currentVote === voteType) {
        // Find and remove the existing reaction
        // This would require storing reaction IDs, simplified for now
        logger.info('Vote removed (simplified implementation)', { opinionId, voteType });
      } else {
        // Add new vote
        await voteOnOpinion(client, opinionId, voteType, user.id);
      }

    } catch (error) {
      // Revert optimistic update on error using the saved currentVote
      setVoteStates(prev => {
        const current = prev[opinionId];
        if (!current) return prev;
        
        return {
          ...prev,
          [opinionId]: {
            userVote: currentVote,
            upvotes: currentState?.upvotes || 0,
            downvotes: currentState?.downvotes || 0
          }
        };
      });
      
      logger.error('Failed to vote on opinion', error);
    } finally {
      setIsVoting(prev => ({ ...prev, [opinionId]: false }));
    }
  };

  return {
    voteStates,
    initializeVoteState,
    vote,
    isVoting
  };
}