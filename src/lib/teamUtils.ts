/**
 * Creates a 3-letter abbreviation from a team name
 * For example: "FC Barcelone" -> "FCB", "Paris Saint-Germain" -> "PSG"
 * 
 * @param teamName The full team name
 * @returns A 3-letter abbreviated version of the team name
 */
export function getTeamAbbreviation(teamName: string): string {
  if (!teamName) return '';
  
  // Common known abbreviations
  const knownAbbreviations: Record<string, string> = {
    'Paris Saint-Germain': 'PSG',
    'Manchester United': 'MUN',
    'Manchester City': 'MCI',
    'Real Madrid': 'RMA',
    'Barcelona': 'BAR',
    'FC Barcelone': 'FCB',
    'Bayern Munich': 'BAY',
    'Borussia Dortmund': 'BVB',
    'Juventus': 'JUV',
    'AC Milan': 'ACM',
    'Inter Milan': 'INT',
    'Liverpool': 'LIV',
    'Chelsea': 'CHE',
    'Arsenal': 'ARS',
    'Tottenham Hotspur': 'TOT',
  };
  
  // Clean the team name by removing special characters and suffixes
  let cleanedName = teamName
    // Remove (w) for women's teams
    .replace(/\s*\(w\)\s*/gi, '')
    // Remove other common suffixes in parentheses
    .replace(/\s*\([^)]*\)\s*/g, '')
    // Remove FC, CF, AC at the beginning if followed by other words
    .replace(/^(FC|CF|AC)\s+(.+)/i, '$2')
    // Clean up extra spaces
    .trim();
  
  // Return known abbreviation if available (check both original and cleaned name)
  if (knownAbbreviations[teamName]) {
    return knownAbbreviations[teamName];
  }
  if (knownAbbreviations[cleanedName]) {
    return knownAbbreviations[cleanedName];
  }
  
  // Otherwise, generate a 3-letter abbreviation from the cleaned name
  const words = cleanedName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length >= 3) {
    // For 3+ words, take first letter of first 3 words
    return words.slice(0, 3).map(word => word.charAt(0).toUpperCase()).join('');
  } else if (words.length === 2) {
    // For 2 words, take first 2 letters of first word + first letter of second word
    const firstWord = words[0];
    const secondWord = words[1];
    return (firstWord.substring(0, 2) + secondWord.charAt(0)).toUpperCase();
  } else {
    // For single word, take first 3 letters
    return cleanedName.substring(0, 3).toUpperCase();
  }
}
