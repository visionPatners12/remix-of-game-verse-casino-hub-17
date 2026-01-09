/**
 * Helper to extract a stat value from a statistics array
 * Used for NBA, NHL, and other leagues that store stats as array of { displayName, value }
 */
export interface StatItem {
  displayName?: string;
  name?: string;
  value?: string | number;
}

export function getStatFromArray(
  statistics: StatItem[] | undefined | null,
  name: string
): string | number | null {
  if (!Array.isArray(statistics)) return null;
  
  const stat = statistics.find(
    (s) => s.displayName === name || s.name === name
  );
  
  return stat?.value ?? null;
}

export function getStatNumber(
  statistics: StatItem[] | undefined | null,
  name: string
): number {
  const value = getStatFromArray(statistics, name);
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export function getStatString(
  statistics: StatItem[] | undefined | null,
  name: string
): string {
  const value = getStatFromArray(statistics, name);
  if (value === null || value === undefined) return '';
  return String(value);
}
