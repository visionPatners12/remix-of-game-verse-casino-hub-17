
/**
 * Utility functions for handling Azuro date formats
 * @deprecated Use functions from azuroDateFormatters.ts instead
 */

import { 
  parseToAzuroTimestamp, 
  formatAzuroTimestamp, 
  azuroTimestampToISOString 
} from './azuroDateFormatters';

/**
 * @deprecated Use parseToAzuroTimestamp and formatAzuroTimestamp instead
 * Formats a date from Azuro data (which can be Unix timestamp or ISO string)
 * @param dateValue - The date value from Azuro (number or string)
 * @returns Formatted date string
 */
export function formatAzuroDate(dateValue: number | string): string {
  if (!dateValue) return '';
  
  const timestamp = parseToAzuroTimestamp(dateValue);
  if (!timestamp) {
    console.warn('Invalid date value:', dateValue);
    return '';
  }
  
  return formatAzuroTimestamp(timestamp);
}

/**
 * @deprecated Use parseToAzuroTimestamp and azuroTimestampToISOString instead
 * Converts Azuro date to ISO string for form inputs
 * @param dateValue - The date value from Azuro
 * @returns ISO string for datetime-local input
 */
export function azuroDateToISOString(dateValue: number | string): string {
  if (!dateValue) return '';
  
  const timestamp = parseToAzuroTimestamp(dateValue);
  if (!timestamp) return '';
  
  return azuroTimestampToISOString(timestamp);
}

/**
 * Gets team initials for fallback display
 * @param teamName - The team name
 * @returns Team initials (first 2-3 letters)
 */
export function getTeamInitials(teamName: string): string {
  if (!teamName) return '';
  
  const words = teamName.split(' ');
  if (words.length >= 2) {
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
  }
  
  return teamName.slice(0, 3).toUpperCase();
}
