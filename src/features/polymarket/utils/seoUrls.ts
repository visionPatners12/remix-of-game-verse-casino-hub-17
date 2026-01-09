/**
 * SEO-friendly URL utilities for Polymarket events
 */

const slugify = (str: string | undefined | null): string => {
  if (!str) return 'event';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    || 'event';
};

/**
 * Build SEO-friendly Polymarket event URL
 * Format: /polymarket/event/:slug/:id
 */
export function buildPolymarketEventUrl(event: {
  id: string;
  slug?: string | null;
  title?: string | null;
}): string {
  const slug = slugify(event.slug || event.title);
  return `/polymarket/event/${slug}/${event.id}`;
}

/**
 * Extract event ID from the last segment of a path
 * Works for SEO-friendly URLs since ID is always last
 */
export function extractEventIdFromPath(path: string): string | null {
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment || null;
}

/**
 * Simple fallback URL when we only have the ID
 */
export const buildSimplePolymarketEventUrl = (id: string) => `/polymarket/event/event/${id}`;
