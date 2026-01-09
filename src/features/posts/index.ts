// Posts Feature - Unified exports with new architecture

// === CORE ARCHITECTURE ===
// Unified registry system - KISS: One registry for all components
export { UnifiedPostRegistry, createPostComponent, getCreationComponent } from './components/registry/UnifiedPostRegistry';
export { registerPostComponents } from './components/registry/registerComponents';

// Unified hooks
export { usePostReplies } from './hooks/usePostReplies';

// === POST TYPE COMPONENTS ===
// Display components
export { SimplePostComponent } from './components/types/SimplePostComponent';
export { PredictionPostComponent } from './components/types/PredictionPostComponent';
export { OpinionPostComponent } from './components/types/OpinionPostComponent';
export { BetPostComponent } from './components/types/BetPostComponent';
export { HighlightPostComponent } from './components/types/HighlightPostComponent';
export { LiveEventPostComponent } from './components/types/LiveEventPostComponent';

// Legacy components (for compatibility)
export { PostTypeSelector } from './components/creation/PostTypeSelector';
export { MediaUploader } from './components/creation/MediaUploader';
export { HashtagInput } from './components/creation/HashtagInput';

// UI Components
export * from './components/ui';
export * from './components/pages';

// === CONFIGURATION ===
export { POST_TYPE_CONFIGS, getPostTypeConfig, getAllPostTypeConfigs } from './config/postTypes.config';

// === TYPES ===
// New unified types
export type * from '@/types/posts';

// Legacy types (for gradual migration)
export type { 
  PostType as LegacyPostType, 
  PostTypeConfig as LegacyPostTypeConfig, 
  MediaFile, 
  PostCreationState, 
  PostCreationActions 
} from './types/creation';

// === CONSTANTS ===
export { POST_TYPES, DEFAULT_CONFIDENCE, DEFAULT_CURRENCY, DEFAULT_TIP_VISIBILITY } from './constants/postTypes';

// Auto-initialize registry
import './components/registry/registerComponents';
