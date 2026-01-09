import { UnifiedPostRegistry } from './UnifiedPostRegistry';
import { SimplePostComponent } from '../types/SimplePostComponent';
import { PredictionPostComponent } from '../types/PredictionPostComponent';
import { OpinionPostComponent } from '../types/OpinionPostComponent';
import { BetPostComponent } from '../types/BetPostComponent';
import { HighlightPostComponent } from '../types/HighlightPostComponent';
import { LiveEventPostComponent } from '../types/LiveEventPostComponent';
import { PolymarketPredictionPostComponent } from '../types/PolymarketPredictionPostComponent';
import { POST_TYPES } from '@/types/posts';

/**
 * Register all post components in the unified registry
 * KISS: Simple registration without redundant configuration
 */
export function registerPostComponents() {
  // Register Simple Post
  UnifiedPostRegistry.register(
    POST_TYPES.SIMPLE,
    SimplePostComponent,
    'Simple Post'
  );

  // Register Prediction Post
  UnifiedPostRegistry.register(
    POST_TYPES.PREDICTION,
    PredictionPostComponent,
    'Prediction Post'
  );

  // Register Opinion Post
  UnifiedPostRegistry.register(
    POST_TYPES.OPINION,
    OpinionPostComponent,
    'Opinion Post'
  );

  // Register Bet Post
  UnifiedPostRegistry.register(
    POST_TYPES.BET,
    BetPostComponent,
    'Bet Post'
  );

  // Register Highlight Post
  UnifiedPostRegistry.register(
    POST_TYPES.HIGHLIGHT,
    HighlightPostComponent,
    'Highlight Post'
  );

  // Register Live Event Post
  UnifiedPostRegistry.register(
    POST_TYPES.LIVE_EVENT,
    LiveEventPostComponent,
    'Live Event Post'
  );

  // Register Polymarket Prediction Post
  UnifiedPostRegistry.register(
    POST_TYPES.POLYMARKET_PREDICTION,
    PolymarketPredictionPostComponent,
    'Polymarket Prediction Post'
  );
}

// Auto-register on import
registerPostComponents();