
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  
  const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi;
  const matches = text.match(hashtagRegex);
  
  return matches ? [...new Set(matches.map(tag => tag.toLowerCase()))] : [];
}

function formatHashtagForDisplay(hashtag: string): string {
  return hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
}

export function cleanHashtag(hashtag: string): string {
  return hashtag.replace('#', '').toLowerCase();
}

export function validateHashtag(hashtag: string): boolean {
  if (!hashtag) return false;
  
  const cleanTag = cleanHashtag(hashtag);
  
  // Règles de validation
  if (cleanTag.length < 2) return false;
  if (cleanTag.length > 50) return false;
  if (!/^[\w\u00c0-\u024f\u1e00-\u1eff]+$/.test(cleanTag)) return false;
  
  return true;
}

/**
 * Remove spaces from a string to create a hashtag-friendly format
 * "Premier League" → "PremierLeague"
 * "Manchester United" → "ManchesterUnited"
 */
export function removeSpacesForHashtag(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, '');
}

/**
 * Generate automatic hashtags for a match
 * Returns hashtags: [league, homeTeam, awayTeam] without spaces
 */
export function generateMatchHashtags(
  leagueName?: string | null,
  homeTeamName?: string | null,
  awayTeamName?: string | null
): string[] {
  const hashtags: string[] = [];
  
  if (leagueName) {
    hashtags.push(removeSpacesForHashtag(leagueName));
  }
  if (homeTeamName) {
    hashtags.push(removeSpacesForHashtag(homeTeamName));
  }
  if (awayTeamName) {
    hashtags.push(removeSpacesForHashtag(awayTeamName));
  }
  
  // Filter duplicates and empty values
  return [...new Set(hashtags.filter(tag => tag.length > 0))];
}

export function suggestHashtagsFromContent(content: string, matchInfo?: { teamA?: string; teamB?: string; league?: string }): string[] {
  const suggestions: string[] = [];
  
  // Hashtags basés sur le match
  if (matchInfo) {
    if (matchInfo.teamA && matchInfo.teamB) {
      const teamA = cleanHashtag(matchInfo.teamA);
      const teamB = cleanHashtag(matchInfo.teamB);
      suggestions.push(`#${teamA}`, `#${teamB}`, `#${teamA}vs${teamB}`);
    }
    
    if (matchInfo.league) {
      suggestions.push(`#${cleanHashtag(matchInfo.league)}`);
    }
  }
  
  // Hashtags génériques populaires
  const popularTags = ['#bet', '#prediction', '#football', '#sport', '#live'];
  suggestions.push(...popularTags);
  
  return [...new Set(suggestions)];
}
