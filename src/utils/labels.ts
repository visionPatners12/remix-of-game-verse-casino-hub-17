/**
 * Safely convert any value to a displayable string label
 * Handles strings, objects with name/title/label properties, null/undefined
 */
export function labelOf(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    return (typeof v.name === 'string' && v.name)
      || (typeof v.title === 'string' && v.title)
      || (typeof v.label === 'string' && v.label)
      || fallback;
  }
  return String(value);
}
