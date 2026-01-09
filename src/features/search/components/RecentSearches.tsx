import React from 'react';
import { Button, Avatar, AvatarImage, AvatarFallback } from '@/ui';
import { Clock, Search, X, User, Hash, Newspaper, Trophy, Users } from 'lucide-react';
import type { RecentSearch } from '../types';
import { cn } from '@/lib/utils';

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSearchClick: (search: RecentSearch) => void;
  onSearchRemove: (search: RecentSearch) => void;
  onClearAll?: () => void;
  className?: string;
  maxResults?: number;
}

export const RecentSearches = React.memo<RecentSearchesProps>(({
  searches,
  onSearchClick,
  onSearchRemove,
  onClearAll,
  className,
  maxResults
}) => {
  const displaySearches = maxResults ? searches.slice(0, maxResults) : searches;

  const getSearchIconByType = (type: RecentSearch['type']) => {
    switch (type) {
      case 'user':
        return User;
      case 'league':
        return Trophy;
      case 'team':
        return Users;
      case 'hashtag':
        return Hash;
      case 'news':
        return Newspaper;
      default:
        return Search;
    }
  };

  const formatSearchTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (displaySearches.length === 0) {
    return null;
  }

  return (
    <div className={cn("", className)}>
      <div className="flex items-center justify-between py-3 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Recent searches</h3>
        </div>
        {onClearAll && displaySearches.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground -mr-2"
          >
            Clear all
          </Button>
        )}
      </div>
      
      <div className="divide-y divide-border">
        {displaySearches.map((search, index) => {
          const IconComponent = getSearchIconByType(search.type);
          
          return (
            <div 
              key={`${search.query}-${search.timestamp}-${index}`} 
              className="flex items-center justify-between px-4 py-3 active:bg-muted/50 transition-colors group"
            >
              {search.type === 'user' && search.userData ? (
                <button
                  onClick={() => onSearchClick(search)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={search.userData.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {search.userData.username?.slice(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">
                      {search.userData.first_name && search.userData.last_name 
                        ? `${search.userData.first_name} ${search.userData.last_name}`
                        : search.userData.username || 'User'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      @{search.userData.username}
                    </div>
                  </div>
                </button>
              ) : search.type === 'league' && search.leagueData ? (
                <button
                  onClick={() => onSearchClick(search)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <Avatar className="h-9 w-9 rounded-lg shrink-0">
                    <AvatarImage src={search.leagueData.league_logo || undefined} />
                    <AvatarFallback className="bg-secondary/20 text-secondary rounded-lg text-xs">
                      {search.leagueData.league_name?.slice(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">
                      {search.leagueData.league_name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {search.leagueData.sport_name} • {search.leagueData.country_name}
                    </div>
                  </div>
                </button>
              ) : search.type === 'team' && search.teamData ? (
                <button
                  onClick={() => onSearchClick(search)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={search.teamData.logo || undefined} />
                    <AvatarFallback className="bg-accent/20 text-accent text-xs">
                      {search.teamData.name?.slice(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">
                      {search.teamData.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {search.teamData.sport_name} • {search.teamData.country_name}
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => onSearchClick(search)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <div className="h-9 w-9 bg-muted/50 rounded-full flex items-center justify-center shrink-0">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate">
                      {search.query}
                    </div>
                    {search.type !== 'text' && (
                      <div className="text-xs text-muted-foreground capitalize">
                        {search.type === 'league' ? 'League' : 
                         search.type === 'team' ? 'Team' :
                         search.type === 'hashtag' ? 'Hashtag' :
                         search.type === 'news' ? 'News' :
                         search.type}
                      </div>
                    )}
                  </div>
                </button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchRemove(search)}
                className="h-7 w-7 p-0 ml-2 shrink-0"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
});

RecentSearches.displayName = 'RecentSearches';