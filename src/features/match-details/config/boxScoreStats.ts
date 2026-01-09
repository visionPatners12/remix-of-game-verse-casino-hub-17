import {
  User,
  Star,
  Shirt,
  MapPin,
  Crown,
  Clock,
  ArrowLeftRight,
  AlertTriangle,
  Target,
  Shield,
  Goal,
  Footprints,
  CircleDot,
  Crosshair,
  Hand,
  AlertCircle,
  Swords,
  ArrowRight,
  Ban,
  CheckCircle,
  XCircle,
  Percent,
  Send,
  Key,
  Square,
  TrendingUp,
  type LucideIcon
} from 'lucide-react';

// ============================================
// BOX SCORE PLAYER METADATA
// ============================================

export interface PlayerMetadataField {
  key: string;
  label: string;
  labelFr: string;
  description: string;
  icon: LucideIcon;
  type: 'number' | 'string' | 'boolean' | 'url';
}

export const PLAYER_METADATA_FIELDS: PlayerMetadataField[] = [
  { key: 'id', label: 'ID', labelFr: 'ID', description: 'Unique identifier for the player', icon: User, type: 'number' },
  { key: 'matchRating', label: 'Match Rating', labelFr: 'Note', description: 'Match performance rating (e.g., "8.00")', icon: Star, type: 'string' },
  { key: 'shirtNumber', label: 'Shirt Number', labelFr: 'Numéro', description: "Player's shirt/jersey number", icon: Shirt, type: 'number' },
  { key: 'position', label: 'Position', labelFr: 'Position', description: 'Playing position (e.g., "Goalkeeper", "Defender")', icon: MapPin, type: 'string' },
  { key: 'isCaptain', label: 'Captain', labelFr: 'Capitaine', description: 'Indicates if the player was the team captain', icon: Crown, type: 'boolean' },
  { key: 'minutesPlayed', label: 'Minutes Played', labelFr: 'Minutes', description: 'Total minutes played in the match', icon: Clock, type: 'number' },
  { key: 'isSubstitute', label: 'Substitute', labelFr: 'Remplaçant', description: 'Indicates if the player started as a substitute', icon: ArrowLeftRight, type: 'boolean' },
  { key: 'offsides', label: 'Offsides', labelFr: 'Hors-jeu', description: 'Number of offsides committed', icon: AlertTriangle, type: 'number' },
  { key: 'name', label: 'Name', labelFr: 'Nom', description: 'Commonly known name of the player', icon: User, type: 'string' },
  { key: 'fullName', label: 'Full Name', labelFr: 'Nom complet', description: "Player's full registered name", icon: User, type: 'string' },
  { key: 'logo', label: 'Logo', labelFr: 'Photo', description: "URL to the player's image/logo, if available", icon: User, type: 'url' },
];

// ============================================
// BOX SCORE STATISTICS CATEGORIES
// ============================================

export type StatCategory = 'offensive' | 'defensive' | 'passing' | 'discipline' | 'advanced' | 'goalkeeper';

export interface BoxScoreStatField {
  key: string;
  label: string;
  labelFr: string;
  description: string;
  icon: LucideIcon;
  category: StatCategory;
  format?: 'number' | 'percentage' | 'decimal';
  isGoalkeeperStat?: boolean;
}

export const BOX_SCORE_STAT_FIELDS: BoxScoreStatField[] = [
  // ========== OFFENSIVE STATS ==========
  { 
    key: 'goalsScored', 
    label: 'Goals Scored', 
    labelFr: 'Buts', 
    description: 'Number of goals the player scored in the match',
    icon: Goal,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'assists', 
    label: 'Assists', 
    labelFr: 'Passes déc.', 
    description: 'Passes that directly led to a goal',
    icon: Footprints,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'shotsTotal', 
    label: 'Total Shots', 
    labelFr: 'Tirs', 
    description: 'Total shots attempted (on and off target)',
    icon: Target,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'shotsOnTarget', 
    label: 'Shots on Target', 
    labelFr: 'Tirs cadrés', 
    description: 'Shots directed at goal that required a save or resulted in a goal',
    icon: Crosshair,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'shotsOffTarget', 
    label: 'Shots off Target', 
    labelFr: 'Tirs non cadrés', 
    description: 'Shots that missed the goal completely',
    icon: XCircle,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'shotsAccuracy', 
    label: 'Shots Accuracy', 
    labelFr: 'Précision tirs', 
    description: 'Percentage of shots that were on target',
    icon: Percent,
    category: 'offensive',
    format: 'percentage'
  },
  { 
    key: 'dribblesTotal', 
    label: 'Total Dribbles', 
    labelFr: 'Dribbles', 
    description: 'Total dribble attempts made',
    icon: CircleDot,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'dribblesSuccessful', 
    label: 'Successful Dribbles', 
    labelFr: 'Dribbles réussis', 
    description: 'Dribble attempts that successfully beat an opponent',
    icon: CheckCircle,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'dribblesFailed', 
    label: 'Failed Dribbles', 
    labelFr: 'Dribbles ratés', 
    description: 'Dribble attempts that were unsuccessful',
    icon: XCircle,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'dribbleSuccessRate', 
    label: 'Dribble Success Rate', 
    labelFr: '% Dribbles', 
    description: 'Percentage of dribbles that were successful',
    icon: Percent,
    category: 'offensive',
    format: 'percentage'
  },
  { 
    key: 'penaltiesScored', 
    label: 'Penalties Scored', 
    labelFr: 'Pénaltys marqués', 
    description: 'Penalty kicks successfully converted into goals',
    icon: Goal,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'penaltiesMissed', 
    label: 'Penalties Missed', 
    labelFr: 'Pénaltys ratés', 
    description: 'Penalty kicks that failed to score',
    icon: Ban,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'penaltiesTotal', 
    label: 'Total Penalties', 
    labelFr: 'Pénaltys', 
    description: 'Total penalty kicks taken',
    icon: Target,
    category: 'offensive',
    format: 'number'
  },
  { 
    key: 'penaltiesAccuracy', 
    label: 'Penalty Accuracy', 
    labelFr: '% Pénaltys', 
    description: 'Percentage of penalties scored',
    icon: Percent,
    category: 'offensive',
    format: 'percentage'
  },

  // ========== DEFENSIVE STATS ==========
  { 
    key: 'tacklesTotal', 
    label: 'Total Tackles', 
    labelFr: 'Tacles', 
    description: 'Total tackles attempted',
    icon: Shield,
    category: 'defensive',
    format: 'number'
  },
  { 
    key: 'interceptionsTotal', 
    label: 'Total Interceptions', 
    labelFr: 'Interceptions', 
    description: "Number of times the player intercepted an opponent's pass",
    icon: Hand,
    category: 'defensive',
    format: 'number'
  },
  { 
    key: 'duelsTotal', 
    label: 'Total Duels', 
    labelFr: 'Duels', 
    description: 'Number of 1v1 challenges contested',
    icon: Swords,
    category: 'defensive',
    format: 'number'
  },
  { 
    key: 'duelsWon', 
    label: 'Duels Won', 
    labelFr: 'Duels gagnés', 
    description: 'Number of duels won',
    icon: CheckCircle,
    category: 'defensive',
    format: 'number'
  },
  { 
    key: 'duelsLost', 
    label: 'Duels Lost', 
    labelFr: 'Duels perdus', 
    description: 'Number of duels lost',
    icon: XCircle,
    category: 'defensive',
    format: 'number'
  },
  { 
    key: 'duelSuccessRate', 
    label: 'Duel Success Rate', 
    labelFr: '% Duels', 
    description: 'Percentage of duels won',
    icon: Percent,
    category: 'defensive',
    format: 'percentage'
  },

  // ========== PASSING STATS ==========
  { 
    key: 'passesTotal', 
    label: 'Total Passes', 
    labelFr: 'Passes', 
    description: 'Total passes attempted',
    icon: Send,
    category: 'passing',
    format: 'number'
  },
  { 
    key: 'passesSuccessful', 
    label: 'Successful Passes', 
    labelFr: 'Passes réussies', 
    description: 'Passes that successfully reached a teammate',
    icon: CheckCircle,
    category: 'passing',
    format: 'number'
  },
  { 
    key: 'passesFailed', 
    label: 'Failed Passes', 
    labelFr: 'Passes ratées', 
    description: 'Passes that failed to reach a teammate',
    icon: XCircle,
    category: 'passing',
    format: 'number'
  },
  { 
    key: 'passesAccuracy', 
    label: 'Passing Accuracy', 
    labelFr: '% Passes', 
    description: 'Percentage of completed passes',
    icon: Percent,
    category: 'passing',
    format: 'percentage'
  },
  { 
    key: 'passesKey', 
    label: 'Key Passes', 
    labelFr: 'Passes clés', 
    description: 'Passes that directly created a goal-scoring opportunity',
    icon: Key,
    category: 'passing',
    format: 'number'
  },

  // ========== DISCIPLINE STATS ==========
  { 
    key: 'cardsYellow', 
    label: 'Yellow Cards', 
    labelFr: 'Cartons jaunes', 
    description: 'Number of yellow cards received',
    icon: Square,
    category: 'discipline',
    format: 'number'
  },
  { 
    key: 'cardsRed', 
    label: 'Red Cards', 
    labelFr: 'Cartons rouges', 
    description: 'Number of red cards received',
    icon: Square,
    category: 'discipline',
    format: 'number'
  },
  { 
    key: 'cardsSecondYellow', 
    label: 'Second Yellow Cards', 
    labelFr: '2ème jaune', 
    description: 'Number of second yellow cards leading to a red card',
    icon: Square,
    category: 'discipline',
    format: 'number'
  },
  { 
    key: 'fouledByOthers', 
    label: 'Fouls Received', 
    labelFr: 'Fautes subies', 
    description: 'Times the player was fouled by opponents',
    icon: AlertCircle,
    category: 'discipline',
    format: 'number'
  },
  { 
    key: 'fouledOthers', 
    label: 'Fouls Committed', 
    labelFr: 'Fautes commises', 
    description: 'Fouls committed by the player',
    icon: AlertTriangle,
    category: 'discipline',
    format: 'number'
  },

  // ========== ADVANCED / xG STATS ==========
  { 
    key: 'expectedGoals', 
    label: 'Expected Goals (xG)', 
    labelFr: 'xG', 
    description: 'The estimated number of goals the player should have scored, based on chance quality',
    icon: TrendingUp,
    category: 'advanced',
    format: 'decimal'
  },
  { 
    key: 'expectedAssists', 
    label: 'Expected Assists (xA)', 
    labelFr: 'xA', 
    description: 'The estimated number of assists the player should have, based on chance quality',
    icon: TrendingUp,
    category: 'advanced',
    format: 'decimal'
  },
  { 
    key: 'expectedGoalsOnTarget', 
    label: 'xG on Target (xGOT)', 
    labelFr: 'xGOT', 
    description: 'The expected number of goals based on the placement and quality of shots on target',
    icon: Crosshair,
    category: 'advanced',
    format: 'decimal'
  },

  // ========== GOALKEEPER STATS ==========
  { 
    key: 'goalsSaved', 
    label: 'Goals Saved', 
    labelFr: 'Arrêts', 
    description: 'Number of opponent shots saved (goalkeeper stat)',
    icon: Hand,
    category: 'goalkeeper',
    format: 'number',
    isGoalkeeperStat: true
  },
  { 
    key: 'goalsConceded', 
    label: 'Goals Conceded', 
    labelFr: 'Buts encaissés', 
    description: "Goals allowed by the player's team while they were the goalkeeper",
    icon: Goal,
    category: 'goalkeeper',
    format: 'number',
    isGoalkeeperStat: true
  },
  { 
    key: 'expectedGoalsOnTargetConceded', 
    label: 'xGOT Conceded', 
    labelFr: 'xGOT encaissés', 
    description: 'The expected number of goals a goalkeeper should have conceded based on shots faced',
    icon: TrendingUp,
    category: 'goalkeeper',
    format: 'decimal',
    isGoalkeeperStat: true
  },
  { 
    key: 'expectedGoalsPrevented', 
    label: 'xG Prevented (xGP)', 
    labelFr: 'xGP', 
    description: 'Difference between expected goals on target conceded and actual goals conceded (goalkeeper stat)',
    icon: Shield,
    category: 'goalkeeper',
    format: 'decimal',
    isGoalkeeperStat: true
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get stats by category
 */
export const getStatsByCategory = (category: StatCategory): BoxScoreStatField[] => {
  return BOX_SCORE_STAT_FIELDS.filter(stat => stat.category === category);
};

/**
 * Get stat field by key
 */
export const getStatField = (key: string): BoxScoreStatField | undefined => {
  return BOX_SCORE_STAT_FIELDS.find(stat => stat.key === key);
};

/**
 * Get category label
 */
export const getCategoryLabel = (category: StatCategory, lang: 'en' | 'fr' = 'fr'): string => {
  const labels: Record<StatCategory, { en: string; fr: string }> = {
    offensive: { en: 'Offensive', fr: 'Offensif' },
    defensive: { en: 'Defensive', fr: 'Défensif' },
    passing: { en: 'Passing', fr: 'Passes' },
    discipline: { en: 'Discipline', fr: 'Discipline' },
    advanced: { en: 'Advanced', fr: 'Avancé' },
    goalkeeper: { en: 'Goalkeeper', fr: 'Gardien' },
  };
  return labels[category][lang];
};

/**
 * Format stat value based on format type
 */
export const formatStatValue = (value: number | string, format?: BoxScoreStatField['format']): string => {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'decimal':
      return value.toFixed(2);
    default:
      return value.toString();
  }
};

/**
 * Key stats to display in compact view (priority order)
 */
export const COMPACT_VIEW_STATS: string[] = [
  'goalsScored',
  'assists',
  'shotsOnTarget',
  'passesAccuracy',
  'duelsWon',
  'tacklesTotal',
  'expectedGoals',
  'expectedAssists',
];

/**
 * Goalkeeper-specific compact stats
 */
export const GOALKEEPER_COMPACT_STATS: string[] = [
  'goalsSaved',
  'goalsConceded',
  'passesAccuracy',
  'expectedGoalsPrevented',
];
