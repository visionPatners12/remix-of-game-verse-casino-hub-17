/**
 * Determines if a match is finished based on is_prematch and is_live flags
 * When both are false, the match has no active markets = finished
 */
export function isMatchFinished(match: {
  is_prematch?: boolean;
  is_live?: boolean;
}): boolean {
  return !match.is_prematch && !match.is_live;
}
