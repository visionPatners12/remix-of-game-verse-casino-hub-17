import { Rumours } from '../types/player';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';

interface PlayerTransferRumoursProps {
  rumours: Rumours;
}

export function PlayerTransferRumours({ rumours }: PlayerTransferRumoursProps) {
  if (!rumours?.current || rumours.current.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Transfer Rumours
        </h3>
      </div>
      
      <div className="space-y-2">
        {rumours.current.map((rumour, index) => (
          <div 
            key={index}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{rumour.club}</span>
              <span className="text-xs text-muted-foreground">{rumour.rumourDate}</span>
            </div>
            <Badge 
              variant="secondary" 
              className="text-xs"
            >
              {rumour.transferProbability}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
