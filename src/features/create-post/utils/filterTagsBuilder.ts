/**
 * FilterTags Builder - Generates filter tags for GetStream activities
 * 
 * Format:
 * - match:<azuro_game_id>
 * - league:<uuid>
 * - home_team:<uuid>
 * - away_team:<uuid>
 */

export interface FilterTagsInput {
  azuroGameId?: string;      // Azuro game ID (from stg_azuro_games.azuro_game_id)
  leagueId?: string;         // League UUID
  homeTeamId?: string;       // Home team UUID
  awayTeamId?: string;       // Away team UUID
}

/**
 * Build filter_tags array for a single selection
 */
export function buildFilterTags(input: FilterTagsInput): string[] {
  const tags: string[] = [];
  
  if (input.azuroGameId) {
    tags.push(`match:${input.azuroGameId}`);
  }
  
  if (input.leagueId) {
    tags.push(`league:${input.leagueId}`);
  }
  
  if (input.homeTeamId) {
    tags.push(`home_team:${input.homeTeamId}`);
  }
  
  if (input.awayTeamId) {
    tags.push(`away_team:${input.awayTeamId}`);
  }
  
  return tags;
}

/**
 * Build combined filter_tags for multiple selections (combo bets)
 * Returns unique tags from all selections (deduplicated)
 */
export function buildCombinedFilterTags(selections: FilterTagsInput[]): string[] {
  const allTags = selections.flatMap(sel => buildFilterTags(sel));
  return [...new Set(allTags)];
}
