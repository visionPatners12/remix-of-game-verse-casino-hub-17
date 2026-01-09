import { format, type Locale } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Type for Azuro timestamps - Unix timestamps in seconds
 */
export type AzuroTimestamp = number;

/**
 * Options for formatting Azuro dates
 */
export interface AzuroDateOptions {
  locale?: Locale;
  showTime?: boolean;
  showSeconds?: boolean;
}

/**
 * Validates if a value is a valid Azuro timestamp
 * @param value - The value to validate
 * @returns boolean indicating if the value is a valid Azuro timestamp
 */
export function isValidAzuroTimestamp(value: unknown): value is AzuroTimestamp {
  if (typeof value !== 'number') return false;
  if (isNaN(value)) return false;
  if (value <= 0) return false;
  
  // Check if it's a reasonable timestamp (between 2000 and 2100)
  const date = new Date(value * 1000);
  const year = date.getFullYear();
  return year >= 2000 && year <= 2100;
}

/**
 * Converts Azuro timestamp to Date object
 * @param timestamp - Unix timestamp in seconds
 * @returns Date object or null if invalid
 */
export function azuroTimestampToDate(timestamp: AzuroTimestamp): Date | null {
  if (!isValidAzuroTimestamp(timestamp)) return null;
  const date = new Date(timestamp * 1000);
  // Double-check the date is valid
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Converts Azuro timestamp to ISO string for HTML datetime inputs
 * @param timestamp - Unix timestamp in seconds
 * @returns ISO string in format YYYY-MM-DDTHH:mm or empty string if invalid
 */
export function azuroTimestampToISOString(timestamp: AzuroTimestamp): string {
  const date = azuroTimestampToDate(timestamp);
  if (!date) return '';
  return date.toISOString().slice(0, 16);
}

/**
 * Formats Azuro timestamp in French readable format
 * @param timestamp - Unix timestamp in seconds
 * @param options - Formatting options
 * @returns Formatted date string or empty string if invalid
 */
export function formatAzuroTimestamp(
  timestamp: AzuroTimestamp, 
  options: AzuroDateOptions = {}
): string {
  const date = azuroTimestampToDate(timestamp);
  if (!date) return '';
  
  const { locale = fr, showTime = true, showSeconds = false } = options;
  
  const dateFormat = showTime 
    ? `dd/MM/yyyy${showSeconds ? ' HH:mm:ss' : ' HH:mm'}`
    : 'dd/MM/yyyy';
    
  return format(date, dateFormat, { locale });
}

/**
 * Formats Azuro timestamp in short format (dd/mm/yyyy)
 * @param timestamp - Unix timestamp in seconds
 * @returns Short date string or empty string if invalid
 */
export function formatAzuroDateShort(timestamp: AzuroTimestamp): string {
  return formatAzuroTimestamp(timestamp, { showTime: false });
}

/**
 * Formats Azuro timestamp with full date and time
 * @param timestamp - Unix timestamp in seconds
 * @returns Full datetime string or empty string if invalid
 */
export function formatAzuroDateTime(timestamp: AzuroTimestamp): string {
  const date = azuroTimestampToDate(timestamp);
  if (!date) return '';
  
  return format(date, 'dd MMM yyyy HH:mm', { locale: fr });
}

/**
 * Formats Azuro timestamp as relative time (time ago)
 * @param timestamp - Unix timestamp in seconds
 * @returns Relative time string in French or empty string if invalid
 */
export function formatAzuroTimeAgo(timestamp: AzuroTimestamp): string {
  const date = azuroTimestampToDate(timestamp);
  if (!date) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'A few seconds ago';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

/**
 * Formats Azuro timestamp for display based on proximity to current time
 * @param timestamp - Unix timestamp in seconds
 * @returns "Aujourd'hui" if today, otherwise formatted date
 */
export function formatAzuroDateSmart(timestamp: AzuroTimestamp): string {
  const date = azuroTimestampToDate(timestamp);
  if (!date) return '';
  
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) return "Today";
  return format(date, "dd MMM", { locale: fr });
}

/**
 * Formats Azuro timestamp for time display
 * @param timestamp - Unix timestamp in seconds
 * @returns Time in HH:mm format or empty string if invalid
 */
export function formatAzuroTime(timestamp: AzuroTimestamp): string {
  const date = azuroTimestampToDate(timestamp);
  if (!date) return '';
  
  return format(date, "HH:mm");
}

/**
 * Parses mixed input (string or number) to Azuro timestamp
 * Handles cases where API might return string representations of numbers
 * @param input - String or number input
 * @returns Valid Azuro timestamp or null
 */
export function parseToAzuroTimestamp(input: string | number): AzuroTimestamp | null {
  if (typeof input === 'number') {
    return isValidAzuroTimestamp(input) ? input : null;
  }
  
  if (typeof input === 'string') {
    // Try to parse as number (Unix timestamp)
    const numericValue = parseInt(input, 10);
    if (!isNaN(numericValue) && input === numericValue.toString()) {
      return isValidAzuroTimestamp(numericValue) ? numericValue : null;
    }
    
    // Try to parse as ISO string and convert to timestamp
    const date = new Date(input);
    if (!isNaN(date.getTime())) {
      return Math.floor(date.getTime() / 1000);
    }
  }
  
  return null;
}