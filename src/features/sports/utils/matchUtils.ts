// Match utilities - Centralized logic for match operations
import type { MatchData } from '../types';

/**
 * Detect if a match is currently live
 */
export function isMatchLive(match: MatchData): boolean {
  if (!match.state) return false;
  return match.state.toLowerCase() === 'live' || match.state.toLowerCase() === 'inplay';
}

/**
 * Format match start time for display
 */
export function formatMatchTime(startsAt?: string): string {
  if (!startsAt) return '';
  
  const date = new Date(startsAt);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  // If match starts within 24 hours, show relative time
  if (diffMins > 0 && diffMins < (24 * 60)) {
    if (diffMins < 60) return `Dans ${diffMins}min`;
    const hours = Math.floor(diffMins / 60);
    return `Dans ${hours}h`;
  }
  
  // Otherwise show formatted date/time
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calculate match score from participants data
 */
export function calculateMatchScore(match: MatchData): { home: number; away: number } | null {
  if (!match.participants || match.participants.length < 2) return null;
  
  // Try to extract score from match data
  if (match.scores) {
    return {
      home: match.scores.home || 0,
      away: match.scores.away || 0
    };
  }
  
  return null;
}

/**
 * Get match status display text
 */
export function getMatchStatusText(match: MatchData): string {
  if (!match.state) return 'À venir';
  
  const state = match.state.toLowerCase();
  
  switch (state) {
    case 'live':
    case 'inplay':
      return 'En direct';
    case 'finished':
    case 'ended':
      return 'Terminé';
    case 'postponed':
      return 'Reporté';
    case 'cancelled':
      return 'Annulé';
    case 'paused':
      return 'Suspendu';
    default:
      return 'À venir';
  }
}

/**
 * Filter matches by search query
 */
export function filterMatchesByQuery(matches: MatchData[], query: string): MatchData[] {
  if (!query.trim()) return matches;
  
  const normalizedQuery = query.toLowerCase();
  
  return matches.filter(match => {
    // Search in team names
    const participants = match.participants || [];
    const teamNames = participants.map(p => p.name.toLowerCase()).join(' ');
    
    // Search in league name
    const leagueName = match.league?.name?.toLowerCase() || '';
    
    // Search in match title
    const title = match.title?.toLowerCase() || '';
    
    return teamNames.includes(normalizedQuery) || 
           leagueName.includes(normalizedQuery) || 
           title.includes(normalizedQuery);
  });
}

/**
 * Sort matches by priority (live first, then by start time)
 */
export function sortMatchesByPriority(matches: MatchData[]): MatchData[] {
  return [...matches].sort((a, b) => {
    // Live matches first
    const aIsLive = isMatchLive(a);
    const bIsLive = isMatchLive(b);
    
    if (aIsLive && !bIsLive) return -1;
    if (!aIsLive && bIsLive) return 1;
    
    // Then by start time
    const aTime = a.startsAt ? new Date(a.startsAt).getTime() : 0;
    const bTime = b.startsAt ? new Date(b.startsAt).getTime() : 0;
    
    return aTime - bTime;
  });
}
