import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getConditionStateInfo } from '@/utils/conditionHelpers';
import { ConditionState } from '@/types';

interface ConditionStateBadgeProps {
  state: ConditionState;
  className?: string;
}

export function ConditionStateBadge({ state, className }: ConditionStateBadgeProps) {
  const stateInfo = getConditionStateInfo(state);
  
  if (!stateInfo) {
    return null; // Don't show badge for Active state
  }

  const { icon: Icon, label, className: stateClassName } = stateInfo;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${stateClassName} ${className || ''}`}>
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </div>
  );
}