// ===== CREATE-POST FEATURE =====
// Autonomous feature for post creation

// === TYPES ===
export type { PostType, PostTypeConfig, MediaFile, PostCreationState, PostCreationActions } from './types/creation';

// === CONSTANTS ===
export { POST_TYPES, DEFAULT_CONFIDENCE, DEFAULT_CURRENCY, DEFAULT_TIP_VISIBILITY } from './constants';

// === HOOKS ===
export { usePostCreation } from './hooks/usePostCreation';

// === COMPONENTS ===
export * from './components';

// === SERVICES ===
export { PostCreationService } from './services/PostCreationService';

// === MAIN EXPORTS ===
export { CreatePostPageUI } from './components/pages/CreatePostPageUI';