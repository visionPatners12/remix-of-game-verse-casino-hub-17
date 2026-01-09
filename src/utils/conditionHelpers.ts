import { XCircle, CheckCircle, PauseCircle, Trophy, XOctagon } from 'lucide-react';
import { ConditionState } from '@/types';

export interface ConditionStateInfo {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className: string;
  isActive: boolean;
}

export const getConditionStateInfo = (state: ConditionState): ConditionStateInfo | null => {
  switch (state) {
    case ConditionState.Canceled:
      return {
        icon: XCircle,
        label: 'Canceled',
        className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800',
        isActive: false
      };
    case ConditionState.Removed:
      return {
        icon: XCircle,
        label: 'Removed',
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800',
        isActive: false
      };
    case ConditionState.Resolved:
      return {
        icon: CheckCircle,
        label: 'Resolved',
        className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800',
        isActive: false
      };
    case ConditionState.Stopped:
      return {
        icon: PauseCircle,
        label: 'Stopped',
        className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800',
        isActive: false
      };
    case ConditionState.Active:
    default:
      return null; // No icon for Active state
  }
};

export const isConditionActive = (state: ConditionState): boolean => {
  return state === ConditionState.Active;
};

export interface SelectionResultInfo {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className: string;
  isWon: boolean;
}

export const getSelectionResultInfo = (isWon: boolean | null): SelectionResultInfo | null => {
  if (isWon === null) return null;
  
  if (isWon) {
    return {
      icon: Trophy,
      label: 'Won',
      className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800',
      isWon: true
    };
  }
  
  return {
    icon: XOctagon,
    label: 'Lost',
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800',
    isWon: false
  };
};