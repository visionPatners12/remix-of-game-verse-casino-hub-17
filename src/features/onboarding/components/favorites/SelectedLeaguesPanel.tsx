import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectedLeague {
  id: string;
  name: string;
  logo?: string;
  country?: string;
  sport?: string;
}

interface SelectedLeaguesPanelProps {
  selectedLeagues: SelectedLeague[];
  onRemove: (id: string) => void;
  maxCount: number;
  className?: string;
}

export const SelectedLeaguesPanel = ({
  selectedLeagues,
  onRemove,
  maxCount,
  className
}: SelectedLeaguesPanelProps) => {
  if (selectedLeagues.length === 0) return null;

  return (
    <div className={cn("px-4 mb-4", className)}>
      <div className="bg-card border border-border/60 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Ligues sélectionnées</h3>
          <span className="text-xs text-muted-foreground">
            {selectedLeagues.length}/{maxCount}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {selectedLeagues.map((league) => (
            <div
              key={league.id}
              className="flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm font-medium"
            >
              {/* League Logo */}
              {league.logo && (
                <div className="w-4 h-4 rounded-sm bg-white/80 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={league.logo}
                    alt={`${league.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <span className="text-xs truncate max-w-24">{league.name}</span>
              
              <button
                onClick={() => onRemove(league.id)}
                className="w-4 h-4 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors focus-ring ml-1"
                aria-label={`Retirer ${league.name}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};