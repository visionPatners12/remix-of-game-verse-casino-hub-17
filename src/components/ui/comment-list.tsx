// 🎯 Reusable Comment List Component
// Single source of truth for displaying comments with GIF support

import React from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import type { Comment } from '@/types/feed';

export interface CommentListProps {
  comments: Comment[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
  className?: string;
}

export function CommentList({ 
  comments, 
  isLoading = false,
  emptyMessage = "No comments yet",
  emptySubMessage = "Be the first to comment!",
  className
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        {emptySubMessage && (
          <p className="text-xs text-muted-foreground mt-1">{emptySubMessage}</p>
        )}
      </motion.div>
    );
  }

  return (
    <div className={className} role="list" aria-label="Comments">
      <div className="divide-y divide-border/30">
        <AnimatePresence mode="popLayout">
          {comments.map((comment, index) => (
            <motion.article 
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3 py-3 first:pt-0"
              role="listitem"
              aria-label={`Comment by ${comment.fullName}`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0" aria-hidden="true">
                <AvatarImage src={comment.avatar} alt="" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {comment.fullName?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.fullName}</span>
                  <span className="text-xs text-muted-foreground" aria-hidden="true">
                    @{comment.username || comment.fullName?.toLowerCase().replace(/\s+/g, '') || 'user'}
                  </span>
                  {comment.timestamp && (
                    <time className="text-xs text-muted-foreground" aria-label={`Posted ${comment.timestamp}`}>
                      <span aria-hidden="true">· </span>{comment.timestamp}
                    </time>
                  )}
                </div>
                {comment.text && (
                  <p className="text-sm text-foreground/90 mt-0.5 break-words">{comment.text}</p>
                )}
                {comment.gif && (
                  <img 
                    src={comment.gif.previewUrl || comment.gif.url} 
                    alt={comment.gif.alt || 'Animated GIF'} 
                    className="mt-2 max-w-[200px] rounded-lg"
                  />
                )}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
