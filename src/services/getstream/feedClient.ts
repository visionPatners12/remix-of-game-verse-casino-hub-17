import { useGetStream } from '@/contexts/StreamProvider';

/**
 * Hook-based approach to get GetStream client
 * @deprecated Use useGetStream hook directly in components
 */
export const useGetStreamFeedClient = () => {
  return useGetStream();
};

/**
 * @deprecated Use useGetStream hook directly in components
 * This function is kept for backward compatibility but will be removed
 */
export async function getStreamClient() {
  throw new Error('getStreamClient is deprecated. Use useGetStream hook in React components instead.');
}

/**
 * @deprecated Use useGetStream hook directly in components
 */
export async function initializeFeedClient() {
  throw new Error('initializeFeedClient is deprecated. Use useGetStream hook in React components instead.');
}