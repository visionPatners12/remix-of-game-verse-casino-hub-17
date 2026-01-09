// Sports mapping constants - Centralized sports configuration
import { IconType } from 'react-icons';
import { getSportById } from '@/lib/sportsMapping';

export interface SportMapping {
  id: string;
  name: string;
  slug: string;
  icon: IconType;
  category: 'mainstream' | 'niche' | 'esports' | 'other';
  displayOrder: number;
}

/**
 * Ordered sports mapping by priority (betting volume)
 * 1) Mainstream sports  2) Niche sports  3) E-sports  4) Other
 */
export const SPORTS_MAPPING: SportMapping[] = [
  // Mainstream sports
  { id: "33", name: 'Football', slug: 'football', icon: getSportById("33").icon, category: 'mainstream', displayOrder: 1 },
  { id: "31", name: 'Basketball', slug: 'basketball', icon: getSportById("31").icon, category: 'mainstream', displayOrder: 2 },
  { id: "45", name: 'Tennis', slug: 'tennis', icon: getSportById("45").icon, category: 'mainstream', displayOrder: 3 },
  { id: "32", name: 'Ice Hockey', slug: 'ice-hockey', icon: getSportById("32").icon, category: 'mainstream', displayOrder: 4 },
  { id: "28", name: 'Baseball', slug: 'baseball', icon: getSportById("28").icon, category: 'mainstream', displayOrder: 5 },
  { id: "44", name: 'American Football', slug: 'american-football', icon: getSportById("44").icon, category: 'mainstream', displayOrder: 6 },
  
  // Niche sports
  { id: "40", name: 'Cricket', slug: 'cricket', icon: getSportById("40").icon, category: 'niche', displayOrder: 7 },
  { id: "26", name: 'Volleyball', slug: 'volleyball', icon: getSportById("26").icon, category: 'niche', displayOrder: 8 },
  { id: "1", name: 'Table Tennis', slug: 'table-tennis', icon: getSportById("1").icon, category: 'niche', displayOrder: 9 },
  { id: "36", name: 'MMA', slug: 'mma', icon: getSportById("36").icon, category: 'niche', displayOrder: 10 },
  { id: "29", name: 'Boxing', slug: 'boxing', icon: getSportById("29").icon, category: 'niche', displayOrder: 11 },
  { id: "59", name: 'Rugby Union', slug: 'rugby-union', icon: getSportById("59").icon, category: 'niche', displayOrder: 12 },
  { id: "58", name: 'Rugby League', slug: 'rugby-league', icon: getSportById("58").icon, category: 'niche', displayOrder: 13 },
  
  // E-sports
  { id: "1061", name: 'Counter-Strike 2', slug: 'cs2', icon: getSportById("1061").icon, category: 'esports', displayOrder: 14 },
  { id: "1001", name: 'CS:GO', slug: 'csgo', icon: getSportById("1001").icon, category: 'esports', displayOrder: 15 },
  { id: "1002", name: 'League of Legends', slug: 'lol', icon: getSportById("1002").icon, category: 'esports', displayOrder: 16 },
  { id: "1000", name: 'Dota 2', slug: 'dota-2', icon: getSportById("1000").icon, category: 'esports', displayOrder: 17 },
  
  // Other
  { id: "56", name: 'Politics', slug: 'politics', icon: getSportById("56").icon, category: 'other', displayOrder: 18 },
  { id: "66", name: 'Unique', slug: 'unique', icon: getSportById("66").icon, category: 'other', displayOrder: 19 },
];

/**
 * Get sport mapping by ID
 */
export function getSportMapping(sportId: string): SportMapping | undefined {
  return SPORTS_MAPPING.find(sport => sport.id === sportId);
}

/**
 * Get sports by category
 */
export function getSportsByCategory(category: SportMapping['category']): SportMapping[] {
  return SPORTS_MAPPING.filter(sport => sport.category === category);
}

/**
 * Get mainstream sports (most popular)
 */
export function getMainstreamSports(): SportMapping[] {
  return getSportsByCategory('mainstream');
}
