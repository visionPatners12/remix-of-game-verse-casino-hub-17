/**
 * SEO-friendly URL utilities
 * Generates human-readable URLs while keeping UUID for data fetching
 */

const slugify = (str: string | undefined | null): string => {
  if (!str) return 'unknown';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    || 'unknown';
};

/**
 * Build SEO-friendly team URL
 * Format: /team/:sport/:slug/:uuid
 */
export function buildTeamUrl(team: {
  id: string;
  slug?: string | null;
  name?: string | null;
  sport_slug?: string | null;
  sport_name?: string | null;
}): string {
  const sport = slugify(team.sport_slug || team.sport_name);
  const slug = slugify(team.slug || team.name);
  return `/team/${sport}/${slug}/${team.id}`;
}

/**
 * Build SEO-friendly league URL
 * Format: /league/:country/:slug/:uuid
 */
export function buildLeagueUrl(league: {
  id: string;
  slug?: string | null;
  name?: string | null;
  country_slug?: string | null;
  country_name?: string | null;
}): string {
  const country = slugify(league.country_slug || league.country_name);
  const slug = slugify(league.slug || league.name);
  return `/league/${country}/${slug}/${league.id}`;
}

/**
 * Build SEO-friendly match URL
 * Format: /match/:sport/:league/:slug/:uuid
 * slug = home-vs-away
 */
export function buildMatchUrl(match: {
  id: string;
  home_name?: string | null;
  home_slug?: string | null;
  away_name?: string | null;
  away_slug?: string | null;
  league_slug?: string | null;
  league_name?: string | null;
  sport_slug?: string | null;
  sport_name?: string | null;
}): string {
  const sport = slugify(match.sport_slug || match.sport_name);
  const league = slugify(match.league_slug || match.league_name);
  const homeSlug = slugify(match.home_slug || match.home_name);
  const awaySlug = slugify(match.away_slug || match.away_name);
  const matchSlug = `${homeSlug}-vs-${awaySlug}`;
  return `/match/${sport}/${league}/${matchSlug}/${match.id}`;
}

/**
 * Extract UUID from the last segment of a path
 * Works for all SEO-friendly URLs since UUID is always last
 */
export function extractUuidFromPath(path: string): string | null {
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // UUID v4 pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (lastSegment && uuidPattern.test(lastSegment)) {
    return lastSegment;
  }
  
  return null;
}

/**
 * Simple fallback URLs when we only have the ID
 */
export const buildSimpleTeamUrl = (id: string) => `/team/unknown/unknown/${id}`;
export const buildSimpleLeagueUrl = (id: string) => `/league/unknown/unknown/${id}`;
export const buildSimpleMatchUrl = (id: string) => `/match/unknown/unknown/unknown/${id}`;
