// Sports feature - Main exports

// Components
export { SportsHome } from './components/SportsHome';
export { SportsContent } from './components/SportsContent';
export { SportsHeader } from './components/SportsHeader';
export { SportsSubHeader } from './components/SportsSubHeader';
export { SportsLiveView } from './components/SportsLiveView';

export { LeagueSidebar } from './components/LeagueSidebar';
export { MobileLeaguesAccordion } from './components/MobileLeaguesAccordion';


// Hooks - Specific exports for better tree-shaking
export { useLiveStats } from './hooks/useLiveStats';
export { useLiveGames } from './hooks/useLiveGames';
export { useLeaguesWithCounts } from './hooks/useLeaguesWithCounts';
export { useSportsDatabase } from './hooks/useSportsDatabase';

export { useSupabaseGames } from './hooks/useSupabaseGames';
export { useMatchCountsBySport } from './hooks/useMatchCountsBySport';

// Match Card Components
export { UnifiedMatchCard } from './components/MatchCard/components/UnifiedMatchCard';
export type { UnifiedMatchCardVariant } from './components/MatchCard/components/UnifiedMatchCard';

// Types
export type { 
  MatchData, 
  MatchCardProps, 
  LeagueInfo,
  MatchGridProps,
  LeagueSidebarProps,
  SportsTeamInfo,
  ParticipantInfo,
  SportInfo,
  CountryInfo
} from './types';

// RPC Types for new match data structure
export type {
  RpcMatchItem,
  RpcSportInfo,
  RpcTeamInfo,
  RpcLeagueInfo,
  MatchStatusInfo
} from './types/rpc';
export { getMatchStatus } from './types/rpc';

// Filter types
export type {
  GameFilter,
  SportsFilter,
  SearchFilter
} from './types/filters';

// Utils  
export { 
  isMatchLive,
  formatMatchTime,
  getMatchStatusText
} from './utils/matchUtils';

export {
  isLiveState,
  isFinishedState,
  getDisplayStatus,
  getStateBadgeVariant
} from './utils/matchStateHelpers';

export { getMatchStateBadge } from './utils/matchBadgeUtils';
export { shortenCountryName } from './utils/countryNameUtils';

// Hooks
export { useMatchComments } from './hooks/useMatchComments';

export type { MatchState } from './utils/matchStateHelpers';

// Constants
export { 
  SPORTS_MAPPING,
  getSportMapping,
  getSportsByCategory,
  getMainstreamSports
} from './constants/sportsMapping';