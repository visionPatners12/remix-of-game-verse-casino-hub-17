/**
 * Dictionary of common country and tournament name abbreviations
 */
const abbreviations: Record<string, string> = {
  'International tournaments': 'International',
  'International': 'Intl',
  'European Championships': 'Euro',
  'World Championships': 'World',
  'Continental': 'Cont.',
  'Association': 'Assoc.',
  'Federation': 'Fed.',
  'Republic': 'Rep.',
  'Democratic Republic': 'D.R.',
  'United States': 'USA',
  'United Kingdom': 'UK',
  'South Africa': 'S. Africa',
  'New Zealand': 'N. Zealand',
  'Saudi Arabia': 'S. Arabia',
};

/**
 * Shortens long country names using abbreviations
 * Falls back to truncation if no abbreviation found and name is too long
 */
export const shortenCountryName = (countryName: string): string => {
  for (const [long, short] of Object.entries(abbreviations)) {
    if (countryName.includes(long)) {
      return countryName.replace(long, short);
    }
  }

  if (countryName.length > 10) {
    return countryName.substring(0, 10) + '...';
  }

  return countryName;
};
