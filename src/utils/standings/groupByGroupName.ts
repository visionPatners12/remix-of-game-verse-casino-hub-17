/**
 * Shared utility for grouping standings by group_name
 * Used by: football, basketball (non-NBA), hockey (non-NHL), handball, volleyball, cricket
 */

interface BaseStanding {
  group_name?: string | null;
  stage?: string | null;
}

/**
 * Groups standings by group_name field
 * Falls back to stage if group_name is not available
 */
export function groupStandingsByGroupName<T extends BaseStanding>(
  standings: T[],
  defaultKey = '__ungrouped__'
): Record<string, T[]> {
  return standings.reduce((acc, standing) => {
    const group = standing.group_name || standing.stage || defaultKey;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(standing);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Filters standings by selected stage, then groups by group_name
 */
export function filterAndGroupStandings<T extends BaseStanding>(
  standings: T[],
  selectedStage: string | null,
  defaultStage = 'Général',
  defaultGroupKey = '__ungrouped__'
): { groups: Record<string, T[]>; groupNames: string[] } {
  // Filter by stage
  const filteredByStage = selectedStage
    ? standings.filter(s => (s.stage || defaultStage) === selectedStage)
    : standings;

  // Group by group_name
  const groups = groupStandingsByGroupName(filteredByStage, defaultGroupKey);
  const groupNames = Object.keys(groups);

  return { groups, groupNames };
}

/**
 * Extract unique stages from standings
 */
export function getUniqueStages<T extends BaseStanding>(
  standings: T[],
  defaultStage = 'Général'
): string[] {
  return [...new Set(standings.map(s => s.stage || defaultStage))];
}
