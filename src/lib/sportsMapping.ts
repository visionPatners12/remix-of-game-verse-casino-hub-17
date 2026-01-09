/* ---------------------------------------------------------
 *  Icons : react-icons
 *  ↳ npm i react-icons
 * --------------------------------------------------------- */
import {
  FaFutbol,
  FaBasketballBall,
  FaHockeyPuck,
  FaBaseballBall,
  FaFootballBall,
  FaVolleyballBall,
  FaTableTennis,
  FaGavel,
  FaStar,
} from 'react-icons/fa';
import { 
  GiTennisBall,
  GiBoxingGlove,
  GiPunch,
  GiCricketBat, 
  GiRugbyConversion 
} from 'react-icons/gi';
import {
  SiCounterstrike,
  SiDota2,
  SiLeagueoflegends,
} from 'react-icons/si';
import { IconType } from 'react-icons';

/** Type auxiliaire pour garder l'auto-complétion */
interface SportIcon {
  id: number;
  name: string;
  slug: string;
  icon: IconType;
}

/**
 * Tableau trié par ordre d'importance (≈ volume de paris) :
 *  1) sports « mainstream »   2) sports de niche   3) e-sports   4) divers
 */
export const sportsMapping: SportIcon[] = [
  { id: 33, name: 'Football',           slug: 'football',          icon: FaFutbol },
  { id: 31, name: 'Basketball',         slug: 'basketball',        icon: FaBasketballBall },
  { id: 45, name: 'Tennis',             slug: 'tennis',            icon: GiTennisBall },
  { id: 32, name: 'Ice Hockey',         slug: 'ice-hockey',        icon: FaHockeyPuck },
  { id: 32, name: 'Ice Hockey',         slug: 'hockey',            icon: FaHockeyPuck },
  { id: 28, name: 'Baseball',           slug: 'baseball',          icon: FaBaseballBall },
  { id: 44, name: 'American Football',  slug: 'american-football', icon: FaFootballBall },
  { id: 40, name: 'Cricket',            slug: 'cricket',           icon: GiCricketBat },
  { id: 26, name: 'Volleyball',         slug: 'volleyball',        icon: FaVolleyballBall },
  { id: 1,  name: 'Table Tennis',       slug: 'table-tennis',      icon: FaTableTennis },
  { id: 36, name: 'MMA',                slug: 'mma',               icon: GiPunch },
  { id: 29, name: 'Boxing',             slug: 'boxing',            icon: GiBoxingGlove },
  { id: 59, name: 'Rugby Union',        slug: 'rugby-union',       icon: GiRugbyConversion },
  { id: 58, name: 'Rugby League',       slug: 'rugby-league',      icon: GiRugbyConversion },
  { id: 59, name: 'Rugby',              slug: 'rugby',             icon: GiRugbyConversion },

  /* --------- e-sports (généralement listés à part) --------- */
  { id: 1061, name: 'Counter-Strike 2', slug: 'cs2',               icon: SiCounterstrike },
  { id: 1001, name: 'CS:GO',            slug: 'csgo',              icon: SiCounterstrike },
  { id: 1002, name: 'League of Legends',slug: 'lol',               icon: SiLeagueoflegends },
  { id: 1000, name: 'Dota 2',           slug: 'dota-2',            icon: SiDota2 },

  /* --------- catégories miscellanées --------- */
  { id: 56, name: 'Politics',           slug: 'politics',          icon: FaGavel },
  { id: 66, name: 'Unique',             slug: 'unique',            icon: FaStar },
];

// Simple cache for sports lookups to avoid repeated calculations
const sportsCache = new Map<string, SportIcon>();

export const getSportById = (sportIdOrSlug: string | number, fallbackName?: string): SportIcon => {
  // Guard against undefined/null
  if (sportIdOrSlug === undefined || sportIdOrSlug === null) {
    return {
      id: 0,
      name: fallbackName || 'Unknown Sport',
      slug: 'unknown',
      icon: FaStar
    };
  }
  
  const key = sportIdOrSlug.toString();
  
  // Check cache first
  if (sportsCache.has(key)) {
    return sportsCache.get(key)!;
  }
  
  // Simple find operations
  let sport = sportsMapping.find(s => s.slug === key) || 
             sportsMapping.find(s => s.id.toString() === key) || 
             sportsMapping.find(s => s.name === key);
  
  if (sport) {
    sportsCache.set(key, sport);
    return sport;
  }
  
  // Fallback pour les sports non mappés
  const idNumber = typeof sportIdOrSlug === 'string' ? parseInt(sportIdOrSlug) || 0 : sportIdOrSlug;
  const fallbackSport = {
    id: idNumber,
    name: fallbackName || `Sport ${sportIdOrSlug}`,
    slug: `sport-${sportIdOrSlug}`,
    icon: FaStar
  };
  
  sportsCache.set(key, fallbackSport);
  return fallbackSport;
};

export const getSportBySlug = (slug: string, fallbackName?: string): SportIcon => {
  if (!slug) {
    return { id: 0, name: fallbackName || 'Unknown', slug: 'unknown', icon: FaStar };
  }
  
  const lowerInput = slug.toLowerCase();
  
  // Chercher par slug exact
  let sport = sportsMapping.find(s => s.slug === lowerInput);
  
  // Si pas trouvé, chercher par nom (case-insensitive)
  if (!sport) {
    sport = sportsMapping.find(s => s.name.toLowerCase() === lowerInput);
  }
  
  if (sport) {
    return sport;
  }
  
  // Fallback pour les sports non mappés
  return {
    id: 0,
    name: fallbackName || `Sport ${slug}`,
    slug: slug,
    icon: FaStar
  };
};