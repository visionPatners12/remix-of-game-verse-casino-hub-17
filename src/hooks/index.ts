// 🎣 Hooks - Essential Only
// Only exports hooks that are actually used

// Essential UI hooks
export { useIsMobile } from './use-mobile';
export { useScrollDirection } from './useScrollDirection';
export { useVisualViewport } from './useVisualViewport';

// Navigation
export { useNavigation } from './useNavigation';

// Entity follow hook
export { useEntityFollow } from './useEntityFollow';

// Game hooks
export { useGameSounds } from './useGameSounds';
export { useNetworkStatus } from './useNetworkStatus';

// PWA hooks
export { useRegisterSW, usePrecacheAssets } from './pwa/useRegisterSW';
export { usePrefetchRoutes, usePrefetchData, usePrefetchOptimizations } from './usePrefetch';