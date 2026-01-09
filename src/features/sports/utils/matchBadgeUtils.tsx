import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * Returns a badge component for specific match states (Stopped, Finished)
 * Returns null for Live and Prematch states
 */
export const getMatchStateBadge = (state?: string): React.ReactNode => {
  switch (state) {
    case 'Stopped':
      return <Badge variant="destructive" className="bg-orange-500 text-white">🛑 STOPPED</Badge>;
    case 'Finished':
      return <Badge variant="secondary" className="bg-gray-500 text-white">✅ FINISHED</Badge>;
    default:
      return null;
  }
};
