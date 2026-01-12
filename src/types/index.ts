// ============================================
// Central Type Exports
// ============================================

// Feed types (includes core types: author, reactions, comments, media)
// This is the main entry point - feed/index.ts re-exports core types
export * from './feed';

// Selection types (for betting) - basic types only
export type {
  AzuroBettingSelection,
  DisplaySelection,
  FeedSelection,
  OddsSelection,
  TicketSelectionInput,
} from './selection';

// Match types
export type {
  PostMatch,
  FeedMatch,
  TicketMatchData,
} from './match';

// Base types
export * from './base';

// GetStream activity types
export * from './stream';

// Legacy prediction exports (for backward compatibility)
// These are now exported from feed/content
export {
  SelectionSchema as PredictionSelectionSchema,
  MatchSchema as PredictionMatchSchema,
  normalizeBetType,
  type Selection as PredictionSelection,
  type Match as PredictionMatch,
} from './feed/content';