import React from 'react';
import { createPortal } from 'react-dom';
import { FocusPostDisplay } from './FocusPostDisplay';
import { FocusCommentPanel } from './FocusCommentPanel';
import { FocusBreadcrumb } from './FocusBreadcrumb';
import type { FeedPost, Comment } from '@/types/feed';
import type { GifData } from '@/components/ui/gif-picker';

interface DesktopFocusModeProps {
  post: FeedPost;
  comments: Comment[];
  onBack: () => void;
  onAddComment?: (comment: string, gif?: GifData) => void;
}

export function DesktopFocusMode({ 
  post, 
  comments, 
  onBack, 
  onAddComment
}: DesktopFocusModeProps) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-background flex">
      {/* Post Content Area */}
      <div className="flex-1 flex flex-col border-r border-border">
        {/* Header with Breadcrumb */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border">
          <FocusBreadcrumb onBack={onBack} />
        </div>
        
        {/* Scrollable Post Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-6">
            <FocusPostDisplay 
              post={post} 
              comments={comments} 
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Comments */}
      <div className="w-[420px] flex-shrink-0 bg-card/30 h-full">
        <FocusCommentPanel 
          comments={comments}
          onAddComment={onAddComment}
        />
      </div>
    </div>,
    document.body
  );
}
