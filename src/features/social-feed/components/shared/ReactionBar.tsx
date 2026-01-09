import React, { useState } from 'react';
import { Button } from '@/ui';
import { MessageCircle, Heart, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ReactionBarProps {
  likes?: number;
  comments?: number;
  userLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  postId?: string;
}

export function ReactionBar({
  likes = 0,
  comments = 0,
  userLiked = false,
  onLike,
  onComment,
  postId
}: ReactionBarProps) {
  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    onLike?.();
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleShare = async () => {
    const url = postId ? `${window.location.origin}/post/${postId}` : window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          url: url
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The post link has been copied to your clipboard."
        });
      } catch (err) {
        toast({
          title: "Could not copy link",
          description: "Please copy the URL manually from your browser.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div 
      className="flex items-center gap-1 pt-3 border-t border-border/40"
      role="group"
      aria-label="Post actions"
    >
      {/* Comment Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onComment?.();
        }}
        aria-label={`${comments} comments. Click to toggle comments`}
        aria-expanded={false}
        className="flex-1 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-primary"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="h-[18px] w-[18px] group-hover:text-primary transition-colors duration-200" aria-hidden="true" />
        </motion.div>
        <span className="text-sm font-medium tabular-nums" aria-hidden="true">{formatCount(comments)}</span>
      </Button>

      {/* Like Button with Animation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        aria-label={userLiked ? `Unlike post. ${likes} likes` : `Like post. ${likes} likes`}
        aria-pressed={userLiked}
        className={cn(
          "flex-1 gap-2 transition-all duration-200 group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-primary",
          userLiked 
            ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        )}
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Heart 
            className={cn(
              "h-[18px] w-[18px] transition-all duration-300",
              userLiked && "fill-current drop-shadow-sm"
            )} 
            aria-hidden="true"
          />
        </motion.div>
        <motion.span 
          className="text-sm font-medium tabular-nums"
          key={likes}
          initial={{ y: userLiked ? -10 : 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        >
          {formatCount(likes)}
        </motion.span>
        
        {/* Particle effect on like */}
        <AnimatePresence>
          {isAnimating && userLiked && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-red-500"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 1, 
                    opacity: 1 
                  }}
                  animate={{ 
                    x: Math.cos(i * 60 * Math.PI / 180) * 20,
                    y: Math.sin(i * 60 * Math.PI / 180) * 20,
                    scale: 0,
                    opacity: 0
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  aria-hidden="true"
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </Button>

      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleShare();
        }}
        aria-label="Share post"
        className="flex-1 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-primary"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: -10 }}
          whileTap={{ scale: 0.95 }}
        >
          <Share className="h-[18px] w-[18px] group-hover:text-primary transition-colors duration-200" aria-hidden="true" />
        </motion.div>
      </Button>
    </div>
  );
}
