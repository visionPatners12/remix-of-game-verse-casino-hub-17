import { z } from 'zod';

/**
 * Bet Type Enum - Includes both modern and legacy values
 * Modern: single, parlay, system
 * Legacy: simple, combiné (for backward compatibility)
 */
export const BetTypeSchema = z.enum(['single', 'parlay', 'system', 'simple', 'combiné']);
export type BetType = z.infer<typeof BetTypeSchema>;

/**
 * Legacy Bet Type Mapping - For backward compatibility
 */
export const LEGACY_BET_TYPE_MAP: Record<string, BetType> = {
  'simple': 'single',
  'combiné': 'parlay',
  'single': 'single',
  'parlay': 'parlay',
  'system': 'system',
} as const;

/**
 * Normalize bet type from legacy/mixed formats
 */
export const normalizeBetType = (value: string | undefined): BetType => {
  if (!value) return 'single';
  return LEGACY_BET_TYPE_MAP[value] ?? 'single';
};

/**
 * Selection Schema - A single selection in a bet/prediction
 */
export const SelectionSchema = z.object({
  marketType: z.string(),
  pick: z.string(),
  odds: z.number(),
  conditionId: z.string().optional(),
  outcomeId: z.string().optional(),
  azuroId: z.string().optional(),
  matchName: z.string().optional(),
  homeTeam: z.string().optional(),
  awayTeam: z.string().optional(),
  league: z.string().optional(),
  leagueId: z.string().optional(),
  sport: z.string().optional(),
  sportId: z.string().optional(),
  startsAt: z.string().optional(),
  homeTeamId: z.string().optional(),
  awayTeamId: z.string().optional(),
});

export type Selection = z.infer<typeof SelectionSchema>;

/**
 * Match Schema - Match context for predictions/bets
 */
export const MatchSchema = z.object({
  id: z.string(),
  date: z.string(),
  homeId: z.string(),
  homeName: z.string(),
  awayId: z.string(),
  awayName: z.string(),
  league: z.string(),
  leagueId: z.string(),
});

export type Match = z.infer<typeof MatchSchema>;

/**
 * Prediction Data Schema - Complete prediction content
 */
export const PredictionDataSchema = z.object({
  match: MatchSchema,
  selection: SelectionSchema.optional(), // Legacy single selection
  selections: z.array(SelectionSchema).optional(), // Modern multi-selection
  bet_type: BetTypeSchema.optional().default('single'),
  analysis: z.string().optional(),
  confidence: z.number().min(0).max(100),
  hashtags: z.array(z.string()).default([]),
  isPremium: z.boolean().optional().default(false),
  visibility: z.enum(['public', 'premium', 'private']).default('public'),
  // Optional bet info for tips
  betAmount: z.number().optional(),
  currency: z.string().optional(),
});

export type PredictionData = z.infer<typeof PredictionDataSchema>;

/**
 * Bet Data Schema - Complete bet content
 */
export const BetDataSchema = z.object({
  match: MatchSchema.optional(),
  selection: SelectionSchema.optional(), // Legacy single selection support
  selections: z.array(SelectionSchema),
  bet_type: BetTypeSchema.optional().default('single'),
  analysis: z.string().optional(),
  betAmount: z.number(),
  currency: z.string().default('USDT'),
  totalOdds: z.number().optional(),
  potentialWin: z.number().optional(),
  hashtags: z.array(z.string()).default([]),
});

export type BetData = z.infer<typeof BetDataSchema>;

/**
 * Opinion Data Schema
 */
export const OpinionDataSchema = z.object({
  match: z.object({
    matchTitle: z.string(),
    sport: z.string(),
    league: z.string(),
  }).optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  stance: z.enum(['for', 'against', 'neutral']).optional(),
});

export type OpinionData = z.infer<typeof OpinionDataSchema>;

/**
 * Highlight Data Schema - Nested data for highlights
 */
export const HighlightDataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  score: z.string().optional(),
  minute: z.union([z.string(), z.number()]).optional(),
  player: z.string().optional(),
  team: z.string().optional(),
  assist: z.string().optional(),
  stats: z.record(z.union([z.string(), z.number()])).optional(),
}).passthrough();

export type HighlightData = z.infer<typeof HighlightDataSchema>;

/**
 * Highlight Content Schema - Full highlight post content
 */
export const HighlightContentSchema = z.object({
  type: z.enum(['goal', 'summary', 'stat', 'news']),
  match: z.object({
    id: z.string(),
    fixtureId: z.string().nullable().optional(), // UUID for match navigation
    homeTeam: z.string(),
    homeTeamId: z.string().nullable().optional(), // UUID for team navigation
    homeTeamLogo: z.string().nullable().optional(),
    homeTeamAbbr: z.string().nullable().optional(),
    awayTeam: z.string(),
    awayTeamId: z.string().nullable().optional(), // UUID for team navigation
    awayTeamLogo: z.string().nullable().optional(),
    awayTeamAbbr: z.string().nullable().optional(),
    league: z.string(),
    leagueLogo: z.string().nullable().optional(),
    startsAt: z.string().optional(),
    score: z.any().optional(),
    stage: z.string().nullable().optional(),
    round: z.string().nullable().optional(),
  }).optional(),
  data: HighlightDataSchema,
  video: z.object({
    id: z.string(),
    url: z.string(),
    thumbnail: z.string().optional(),
  }).optional(),
});

export type HighlightContent = z.infer<typeof HighlightContentSchema>;

/**
 * Live Event Content Schema
 */
export const LiveEventContentSchema = z.object({
  eventType: z.string(),
  eventTime: z.string(),
  eventMinute: z.number().optional(),
  match: z.object({
    id: z.string(),
    homeTeam: z.string(),
    homeTeamLogo: z.string().nullable().optional(),
    awayTeam: z.string(),
    awayTeamLogo: z.string().nullable().optional(),
    league: z.string(),
    leagueLogo: z.string().nullable().optional(),
    score: z.object({
      home: z.number(),
      away: z.number(),
    }).optional(),
    startsAt: z.string().optional(),
  }),
  team: z.object({
    id: z.string().optional(),
    name: z.string(),
    logo: z.string().nullable().optional(),
  }),
  player: z.object({
    id: z.string().optional(),
    providerId: z.number().optional(),
    name: z.string(),
  }),
  assistingPlayer: z.object({
    id: z.string().optional(),
    providerId: z.number().optional(),
    name: z.string(),
  }).optional(),
  substitutedPlayer: z.object({
    id: z.string().optional(),
    providerId: z.number().optional(),
    name: z.string(),
  }).optional(),
  sport: z.enum(['football', 'basketball', 'tennis']).default('football'),
});

export type LiveEventContent = z.infer<typeof LiveEventContentSchema>;

/**
 * Simple Content Schema
 */
export const SimpleContentSchema = z.object({
  text: z.string(),
  media: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['image', 'video', 'gif']).optional(),
    url: z.string(),
    alt: z.string().optional(),
  })).default([]),
});

export type SimpleContent = z.infer<typeof SimpleContentSchema>;

/**
 * Polymarket Prediction Content Schema
 */
export const PolymarketPredictionContentSchema = z.object({
  // Référence market et event
  market_id: z.string(),
  event_id: z.string().optional(),
  clob_token_id: z.string().optional(),
  
  // Snapshot des données
  event_title: z.string(),
  event_image: z.string().optional(),
  market_question: z.string().optional(),
  
  // Prédiction utilisateur
  outcome: z.string(),
  odds: z.number(),
  probability: z.number().optional(),
  
  // Contenu
  analysis: z.string().optional(),
  confidence: z.number().min(1).max(5),
  
  // Métadonnées
  category: z.string().optional(),
  end_date: z.string().optional(),
  
  // Statut
  status: z.enum(['pending', 'won', 'lost']).default('pending'),
  is_won: z.boolean().optional(),
  final_outcome: z.string().optional(),
  
  // Premium
  is_premium: z.boolean().optional().default(false),
  visibility: z.enum(['public', 'premium', 'private']).default('public'),
});

export type PolymarketPredictionContent = z.infer<typeof PolymarketPredictionContentSchema>;
