// Post Detail Types

export interface PostDetailState {
  replyText: string;
  isLoading: boolean;
  isSubmittingReply: boolean;
}

export interface PostReply {
  id: string;
  author: {
    username: string;
    fullName: string;
    avatar?: string;
  };
  timestamp: string;
  text: string;
  reactions: {
    likes: number;
    comments: number;
    shares: number;
    userLiked: boolean;
  };
  tags: string[];
}

export interface StreamPost {
  id: string;
  type: 'prediction' | 'simple' | 'opinion' | 'bet';
  author: {
    username: string;
    fullName: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  tags: string[];
  reactions: {
    likes: number;
    comments: number;
    shares: number;
    userLiked: boolean;
  };
  activityId: string;
  prediction?: any;
}

export interface PostDetailActions {
  handleReply: () => void;
  setReplyText: (text: string) => void;
  handleReplyReaction: (replyId: string) => {
    onLike: () => void;
    onComment: () => void;
    onShare: () => void;
  };
}

export interface PostDetailViewProps {
  postId: string;
  streamPost: StreamPost | null;
  replies: PostReply[];
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onReply: () => void;
  onNavigateBack: () => void;
  onReplyReaction: (replyId: string) => {
    onLike: () => void;
    onComment: () => void;
    onShare: () => void;
  };
}