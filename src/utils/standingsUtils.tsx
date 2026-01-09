import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export function getStatusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case 'promotion':
    case 'champions_league':
    case 'europa_league':
      return <ArrowUp className="w-3 h-3 text-green-600" />;
    case 'relegation':
    case 'relegation_playoff':
      return <ArrowDown className="w-3 h-3 text-red-600" />;
    case 'same':
    case 'no_change':
    default:
      return <Minus className="w-3 h-3 text-muted-foreground" />;
  }
}

export function getGoalDifferenceColor(goalDifference: number): string {
  if (goalDifference > 0) {
    return 'text-green-600';
  } else if (goalDifference < 0) {
    return 'text-red-600';
  }
  return 'text-muted-foreground';
}

export function getPositionChangeColor(change: number): string {
  if (change > 0) {
    return 'text-green-600';
  } else if (change < 0) {
    return 'text-red-600';
  }
  return 'text-muted-foreground';
}