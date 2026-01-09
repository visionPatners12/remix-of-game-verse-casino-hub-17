import { useMemo } from 'react';

/**
 * Hook to normalize hashtags - extracts, cleans and deduplicates hashtags
 * Memoized to prevent recalculation on every render
 */
export function useNormalizedHashtags(tags: unknown, hashtags?: unknown): string[] {
  return useMemo(() => {
    const rawValue = tags || hashtags;
    
    // Ensure array
    const rawArray = (() => {
      if (Array.isArray(rawValue)) return rawValue.filter((v): v is string => typeof v === 'string');
      if (typeof rawValue === 'string') {
        try {
          const parsed = JSON.parse(rawValue);
          return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [rawValue];
        } catch {
          return rawValue ? [rawValue] : [];
        }
      }
      return [];
    })();
    
    // Normalize: remove #, trim, deduplicate (no more space splitting)
    return rawArray
      .map((tag: string) => tag.replace(/#/g, '').trim())
      .filter((tag): tag is string => tag.length > 0)
      .filter((tag, index, self) => self.indexOf(tag) === index);
  }, [tags, hashtags]);
}
