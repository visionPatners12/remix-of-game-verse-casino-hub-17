import type { PolymarketEvent } from '../types/events';

/**
 * Removes spaces from a string to create a hashtag-friendly format
 */
const removeSpacesForHashtag = (text: string): string => {
  return text.replace(/\s+/g, '');
};

/**
 * Generates hashtags from a Polymarket event
 * Uses: category, tags, and adds "Polymarket" as generic tag
 */
export function generatePolymarketHashtags(event: PolymarketEvent): string[] {
  const hashtags: string[] = [];
  
  // Category (e.g., "Sports" → "Sports")
  if (event.category) {
    hashtags.push(removeSpacesForHashtag(event.category));
  }
  
  // Event tags (e.g., "NFL", "Super Bowl")
  if (event.tags && event.tags.length > 0) {
    for (const tag of event.tags.slice(0, 5)) { // Max 5 tags
      if (tag.label) {
        hashtags.push(removeSpacesForHashtag(tag.label));
      }
    }
  }
  
  // Filter duplicates and empty values
  return [...new Set(hashtags.filter(tag => tag.length > 0))];
}
