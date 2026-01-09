/**
 * Simple search helpers for normalizing and expanding search terms
 */

/**
 * Normalize text for better search matching
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Common abbreviations for sports teams and leagues
 */
const TEAM_ABBREVIATIONS: Record<string, string[]> = {
  'paris saint-germain': ['psg', 'paris'],
  'real madrid': ['real', 'madrid'],
  'barcelona': ['barca', 'fcb'],
  'manchester united': ['man utd', 'united', 'mufc'],
  'manchester city': ['man city', 'city', 'mcfc'],
  'bayern munich': ['bayern', 'fcb', 'munich'],
  'ac milan': ['milan', 'acm'],
  'inter milan': ['inter', 'internazionale'],
  'atletico madrid': ['atletico', 'atleti'],
  'liverpool': ['lfc', 'reds'],
  'arsenal': ['gunners', 'afc'],
  'chelsea': ['blues', 'cfc'],
  'tottenham': ['spurs', 'thfc'],
  'juventus': ['juve', 'juventus fc'],
  'napoli': ['ssc napoli'],
  'as roma': ['roma', 'asr'],
  'lazio': ['ss lazio'],
  'borussia dortmund': ['bvb', 'dortmund'],
  'ajax': ['afc ajax', 'amsterdam'],
  'benfica': ['slb', 'benfica lisbon'],
  'porto': ['fc porto', 'fcp'],
  'sporting': ['sporting cp', 'scp'],
};

/**
 * Get all searchable terms for a team or league name
 */
export function getSearchableTerms(name: string): string[] {
  const normalized = normalizeText(name);
  const terms = new Set<string>();
  
  // Add the normalized full name
  terms.add(normalized);
  
  // Add individual words (split by spaces)
  const words = normalized.split(' ').filter(word => word.length > 1);
  words.forEach(word => terms.add(word));
  
  // Add abbreviations if they exist
  const abbreviations = TEAM_ABBREVIATIONS[normalized];
  if (abbreviations) {
    abbreviations.forEach(abbrev => {
      terms.add(normalizeText(abbrev));
      // Also add words from abbreviations
      const abbrevWords = normalizeText(abbrev).split(' ').filter(word => word.length > 1);
      abbrevWords.forEach(word => terms.add(word));
    });
  }
  
  return Array.from(terms);
}

/**
 * Check if search query matches any of the searchable terms
 */
export function matchesSearchTerms(searchableTerms: string[], query: string): boolean {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
  
  // Each query word must match at least one searchable term
  return queryWords.every(queryWord => 
    searchableTerms.some(term => term.includes(queryWord))
  );
}

/**
 * Get searchable terms for a match (participants + league)
 */
export function getMatchSearchTerms(match: any): string[] {
  const terms = new Set<string>();
  
  // Add participant terms
  if (match.participants) {
    match.participants.forEach((participant: any) => {
      if (participant.name) {
        getSearchableTerms(participant.name).forEach(term => terms.add(term));
      }
    });
  }
  
  // Add league terms
  if (match.league?.name) {
    getSearchableTerms(match.league.name).forEach(term => terms.add(term));
  }
  
  return Array.from(terms);
}