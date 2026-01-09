import { parseToAzuroTimestamp, formatAzuroTimeAgo } from './azuroDateFormatters';

/**
 * @deprecated Use formatAzuroTimeAgo from azuroDateFormatters.ts for Azuro timestamps
 * This function provides a short format and is kept for non-Azuro use cases
 */
export const formatTimeAgo = (timestamp: string): string => {
  // Try to parse as Azuro timestamp first
  const azuroTimestamp = parseToAzuroTimestamp(timestamp);
  if (azuroTimestamp) {
    const fullFormat = formatAzuroTimeAgo(azuroTimestamp);
    // Convert to short format for backwards compatibility
    if (fullFormat.includes('days')) return fullFormat.replace(' ago', '').replace('days', 'd').replace('day', 'd');
    if (fullFormat.includes('hours')) return fullFormat.replace(' ago', '').replace('hours', 'h').replace('hour', 'h');
    if (fullFormat.includes('minutes')) return fullFormat.replace(' ago', '').replace('minutes', 'min').replace('minute', 'min');
    return 'now';
  }
  
  // Fallback to original logic for non-Azuro timestamps
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now.getTime() - time.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return `${days}j`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
};