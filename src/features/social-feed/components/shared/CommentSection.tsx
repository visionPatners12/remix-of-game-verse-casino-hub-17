import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback, Input, Button } from '@/ui';
import { Send, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/features/profile';
import { GifPicker, GifData } from '@/components/ui/gif-picker';
import { CommentInput } from '@/components/ui/comment-input';
import { CommentList } from '@/components/ui/comment-list';


export interface CommentGif {
  url: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface Comment {
  id: string;
  username: string;
  fullName: string;
  displayUsername: string;
  avatar?: string;
  text: string;
  timestamp: string;
  gif?: CommentGif;
}

interface CommentSectionProps {
  comments?: Comment[];
  onAddComment?: (text: string, gif?: GifData) => void;
  showComments?: boolean;
  isLoadingComments?: boolean;
}

export function CommentSection({ 
  comments = [], 
  onAddComment,
  showComments = false,
  isLoadingComments = false
}: CommentSectionProps) {
  if (!showComments) {
    return null;
  }

  const handleSubmit = (text: string, gif?: GifData) => {
    if (onAddComment) {
      onAddComment(text, gif);
    }
  };

  // Map comments to the format expected by CommentList
  const mappedComments = comments.map(c => ({
    id: c.id,
    username: c.username,
    fullName: c.fullName,
    avatar: c.avatar,
    text: c.text,
    timestamp: c.timestamp,
    gif: c.gif
  }));

  return (
    <AnimatePresence>
      <motion.section 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="pt-3 mt-2 border-t border-border/40"
        aria-label="Comments section"
        aria-live="polite"
      >
        {/* Comment input */}
        <CommentInput 
          onSubmit={handleSubmit}
          disabled={!onAddComment}
        />

        {/* Comments list */}
        <div className="mt-4" role="list" aria-label={`${mappedComments.length} comments`}>
          <CommentList 
            comments={mappedComments}
            isLoading={isLoadingComments}
            emptyMessage="No comments yet"
            emptySubMessage=""
          />
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
