import { X } from 'lucide-react';
import { ComponentType } from 'react';

interface SelectedLeague {
  id: string;
  name: string;
  logo?: string;
  country?: string;
  sport?: {
    id: string;
    name: string;
    icon: ComponentType<any>;
  };
}

interface SelectedLeaguesSportPanelProps {
  selectedLeagues: SelectedLeague[];
  onRemove: (id: string) => void;
  maxCount: number;
}

export const SelectedLeaguesSportPanel = ({
  selectedLeagues,
  onRemove,
  maxCount,
}: SelectedLeaguesSportPanelProps) => {
  if (selectedLeagues.length === 0) return null;

  return (
    <div className="px-2 mb-6">
      <div className="border border-border/40 rounded-xl p-4 min-h-[120px]">
        <div className="flex flex-wrap gap-2">
          {selectedLeagues.map((league) => {
            const SportIcon = league.sport?.icon;
            
            return (
              <div
                key={league.id}
                className="flex items-center gap-2 bg-primary/10 text-primary rounded-lg px-3 py-2 text-sm border border-primary/20"
              >
                {/* Sport Icon */}
                {SportIcon && (
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    <SportIcon className="w-4 h-4" />
                  </div>
                )}
                
                {/* League Logo */}
                {league.logo && (
                  <div className="w-5 h-5 rounded-sm bg-white/80 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                
                {/* League Name */}
                <span className="text-xs font-medium truncate flex-1">{league.name}</span>
                
                {/* Remove Button */}
                <button
                  onClick={() => onRemove(league.id)}
                  className="w-4 h-4 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors focus-ring"
                  aria-label={`Remove ${league.name}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};