import { useState, useRef, useCallback, useMemo } from 'react';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEntitySearch } from '@/features/search/hooks/useEntitySearch';
import { useFavoriteSports } from '@/features/onboarding/hooks/useFavoriteSports';
import type { SearchTeam } from '@/features/search/types';
import { cn } from '@/lib/utils';

interface TeamSearchResult {
  team_id: string;
  team_name: string;
  team_logo: string | null;
  country_name: string | null;
  sport_name: string | null;
}

interface TeamSearchForOnboardingProps {
  selectedTeamIds: string[];
  onTeamToggle: (teamId: string) => void;
  maxSelections: number;
  disabled?: boolean;
}

export function TeamSearchForOnboarding({
  selectedTeamIds,
  onTeamToggle,
  maxSelections,
  disabled = false
}: TeamSearchForOnboardingProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { favoriteSports } = useFavoriteSports();
  
  const {
    data: teams,
    isLoading,
    loadMore,
    hasMore
  } = useEntitySearch<SearchTeam>({
    entityType: 'teams',
    query,
    enabled: true,
    favoriteSportIds: favoriteSports,
    debounceMs: 200
  });

  const allItems: TeamSearchResult[] = useMemo(() => 
    teams.map(team => ({
      team_id: team.id,
      team_name: team.name,
      team_logo: team.logo,
      country_name: team.country_name,
      sport_name: team.sport_name
    })),
    [teams]
  );

  const isEmpty = !query.trim();
  const hasResults = allItems.length > 0;
  const showResults = isFocused && !isEmpty && (hasResults || isLoading);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleTeamSelect = (team: TeamSearchResult) => {
    if (disabled) return;
    onTeamToggle(team.team_id);
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!loadMore || !hasMore || isLoading) return;
    
    const target = e.currentTarget;
    const { scrollHeight, scrollTop, clientHeight } = target;
    
    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadMore();
    }
  }, [loadMore, hasMore, isLoading]);

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a team..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow clicks on results
            setTimeout(() => setIsFocused(false), 200);
          }}
          className="pl-10 pr-10"
          aria-label="Search teams"
          autoComplete="off"
        />
        {!isEmpty && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
            tabIndex={-1}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg overflow-hidden">
          {isLoading && allItems.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          )}

          {!isLoading && allItems.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No teams found
            </div>
          )}

          {allItems.length > 0 && (
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-[400px] overflow-y-auto"
            >
              {allItems.map((team: TeamSearchResult, index) => {
                const isSelected = selectedTeamIds.includes(team.team_id);
                const canSelect = !isSelected && selectedTeamIds.length < maxSelections;
                const isDisabled = disabled || (!isSelected && !canSelect);
                
                return (
                  <div key={team.team_id}>
                    <button
                      onClick={() => {
                        if (!isDisabled) handleTeamSelect(team);
                      }}
                      disabled={isDisabled}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 text-left transition-colors",
                        "hover:bg-muted/50 active:bg-muted",
                        isSelected && "bg-primary/5",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {/* Logo */}
                      {team.team_logo ? (
                        <img
                          src={team.team_logo}
                          alt={team.team_name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {team.team_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{team.team_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[team.country_name, team.sport_name].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      
                      {/* Checkbox */}
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                    
                    {/* Séparateur (sauf pour le dernier) */}
                    {index < allItems.length - 1 && (
                      <div className="h-px bg-border mx-3" />
                    )}
                  </div>
                );
              })}

              {/* Loading indicator for infinite scroll */}
              {isLoading && allItems.length > 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* No more results indicator */}
              {!hasMore && allItems.length > 10 && (
                <div className="text-center py-3 text-xs text-muted-foreground">
                  All teams loaded
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}