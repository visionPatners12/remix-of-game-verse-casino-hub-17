// 🏗️ Social Feed Feature - Main Export
// Consolidated export point for all social feed functionality

// ===== MAIN COMPONENTS =====
export { SocialFeedLayout } from './components/feed/SocialFeedLayout';
export { PostDetailView } from './components/feed/PostDetailView';
export { FeedController } from './components/feed/controllers/FeedController';

// ===== SHARED COMPONENTS =====
export { TeamLink } from './components/shared/TeamLink';
export { AddToTicketButton } from './components/shared/AddToTicketButton';
export { ReactionBar } from './components/shared/ReactionBar';
export { CommentSection } from './components/shared/CommentSection';
export { ReactionUsersList } from './components/shared/ReactionUsersList';
export { StyledOddsDisplay } from './components/shared/StyledOddsDisplay';

// ===== FOR YOU FEATURE =====
export { ForYouFeed } from './components/foryou';

// ===== TYPES =====
export type * from './types';
