import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ComponentType } from 'react';

interface SelectedLeague {
  id: string;
  name: string;
  logo?: string;
  country?: string;
  sport?: {
    id: string;
    name: string;
    icon?: ComponentType<any>;
  };
}

interface SelectedLeaguesProps {
  leagues: SelectedLeague[];
  onRemove: (leagueId: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SelectedLeagues = ({
  leagues,
  onRemove,
  disabled = false,
  className
}: SelectedLeaguesProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn("space-y-3", isMobile && "px-4", className)}>
      <h4 className="text-sm font-medium text-foreground">
        My selected leagues {leagues.length > 0 && `(${leagues.length})`}
      </h4>
      
      {leagues.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-lg border border-dashed border-border bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">
            No leagues selected yet
          </p>
          <p className="text-xs text-muted-foreground">
            Search or select leagues below
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {leagues.map((league) => {
            const SportIcon = league.sport?.icon;
            
            return (
              <div
                key={league.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg",
                  "bg-primary/10 border border-primary/20",
                  "text-sm text-primary",
                  "transition-all duration-200",
                  disabled && "opacity-50"
                )}
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
                <span className="font-medium truncate max-w-32">
                  {league.name}
                </span>
                
                {/* Remove Button */}
                <button
                  onClick={() => onRemove(league.id)}
                  disabled={disabled}
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    "hover:bg-primary/20 transition-colors",
                    "text-primary/70 hover:text-primary",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                  aria-label={`Remove ${league.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};