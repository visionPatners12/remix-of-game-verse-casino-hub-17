import type { LucideIcon } from 'lucide-react';
import type { IconType } from 'react-icons';
import { 
  Target, XCircle, Square, ArrowLeftRight, 
  CheckCircle, Video, VideoOff, Flag, Circle 
} from 'lucide-react';
import { GiSoccerKick, GiSoccerBall } from 'react-icons/gi';

// Football event types supported by Highlightly
export const FOOTBALL_EVENT_TYPES = {
  GOAL: 'Goal',
  OWN_GOAL: 'Own Goal',
  PENALTY: 'Penalty',
  MISSED_PENALTY: 'Missed Penalty',
  YELLOW_CARD: 'Yellow Card',
  RED_CARD: 'Red Card',
  SUBSTITUTION: 'Substitution',
  VAR_GOAL_CONFIRMED: 'VAR Goal Confirmed',
  VAR_GOAL_CANCELLED: 'VAR Goal Cancelled',
  VAR_PENALTY: 'VAR Penalty',
  VAR_PENALTY_CANCELLED: 'VAR Penalty Cancelled',
  VAR_OFFSIDE: 'VAR Goal Cancelled - Offside',
} as const;

export type FootballEventType = typeof FOOTBALL_EVENT_TYPES[keyof typeof FOOTBALL_EVENT_TYPES];

// UI configuration with React icons
export interface EventTypeConfig {
  label: string;
  Icon: LucideIcon | IconType;
  color: string;
  bgColor: string;
  fillColor?: string;
}

export const FOOTBALL_EVENT_CONFIG: Record<FootballEventType, EventTypeConfig> = {
  'Goal': { 
    label: 'Goal', 
    Icon: GiSoccerKick, 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
  },
  'Own Goal': { 
    label: 'Own Goal', 
    Icon: GiSoccerBall, 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10',
  },
  'Penalty': { 
    label: 'Penalty', 
    Icon: Target, 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
  },
  'Missed Penalty': { 
    label: 'Missed Penalty', 
    Icon: XCircle, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
  },
  'Yellow Card': { 
    label: 'Yellow Card', 
    Icon: Square, 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-500/10',
    fillColor: 'fill-yellow-500',
  },
  'Red Card': { 
    label: 'Red Card', 
    Icon: Square, 
    color: 'text-red-600', 
    bgColor: 'bg-red-600/10',
    fillColor: 'fill-red-600',
  },
  'Substitution': { 
    label: 'Substitution', 
    Icon: ArrowLeftRight, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
  },
  'VAR Goal Confirmed': { 
    label: 'Goal Confirmed (VAR)', 
    Icon: CheckCircle, 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
  },
  'VAR Goal Cancelled': { 
    label: 'Goal Cancelled (VAR)', 
    Icon: XCircle, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
  },
  'VAR Penalty': { 
    label: 'Penalty (VAR)', 
    Icon: Video, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
  },
  'VAR Penalty Cancelled': { 
    label: 'Penalty Cancelled (VAR)', 
    Icon: VideoOff, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
  },
  'VAR Goal Cancelled - Offside': { 
    label: 'Offside (VAR)', 
    Icon: Flag, 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10',
  },
};

// Helper to get event configuration
export function getEventConfig(eventType: string): EventTypeConfig {
  return FOOTBALL_EVENT_CONFIG[eventType as FootballEventType] || {
    label: eventType,
    Icon: Circle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  };
}
