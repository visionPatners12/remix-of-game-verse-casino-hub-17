// Unified Match Components and Types
export { UnifiedMatchCard } from './UnifiedMatchCard';
export type { UnifiedMatchCardProps, UnifiedMatchCardVariant } from './UnifiedMatchCard';

// Live Score Component
export { LiveMatchScore } from './LiveMatchScore';

export {
  normalizeMatch,
  normalizeFromRpc,
  normalizeFromSupabase,
  isRpcMatchItem,
} from './types';

export type {
  UniversalMatch,
  UniversalTeam,
  UniversalSport,
  UniversalLeague,
  UniversalMatchStatus,
  UniversalScore,
} from './types';
