// 🔧 Feed Utilities - Lightweight Services
// Centralized utilities for feed operations

import { logger } from '@/utils/logger';

// Team name normalization (extracted from teamService for lighter imports)
export const normalizeTeamName = (teamName: string): string => {
  if (!teamName) return '';
  
  // Convert to lowercase and replace spaces/special chars with hyphens
  return teamName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Re-export logger for convenience
export { logger };

// Feed-specific utility functions
export const extractTeamFromContent = (content: string): string | null => {
  // Simple regex to extract team mentions (could be enhanced)
  const teamMatch = content.match(/@(\w+)/);
  return teamMatch ? teamMatch[1] : null;
};

export const formatPostContent = (content: string, maxLength: number = 280): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength - 3) + '...';
};

// Condition styling utilities
export const getConditionCardStyle = (conditionState?: any): string => {
  if (conditionState === 2) { // Resolved
    return 'border-t-4 border-t-success border-l border-r border-b border-border bg-success-subtle';
  }
  if (conditionState === 3 || conditionState === 4) { // Canceled || Removed
    return 'border-t-4 border-t-error border-l border-r border-b border-border bg-error-subtle';
  }
  if (conditionState === 5) { // Stopped
    return 'border-t-4 border-t-warning border-l border-r border-b border-border bg-warning-subtle';
  }
  return 'border';
};

export const getOddsColorClass = (isActive: boolean): string => {
  return isActive ? "text-emerald-500" : "text-muted-foreground";
};

export const formatMatchDate = (date?: string): string => {
  if (!date) return "Aujourd'hui 18:30";
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};