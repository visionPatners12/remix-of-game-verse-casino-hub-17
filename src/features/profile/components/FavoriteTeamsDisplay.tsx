import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, Search } from 'lucide-react';
import { useFavoriteTeams } from '@/features/onboarding/hooks/useFavoriteTeams';
import { useFavoriteSports } from '@/features/onboarding/hooks/useFavoriteSports';
import { useEntitySearch } from '@/features/search/hooks/useEntitySearch';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const MAX_TEAMS = 5;

interface TeamSearchResult {
  id: string;
  name: string;
  logo: string;
  slug: string;
  sport_name: string;
  sport_id: string;
  country_name: string;
}

export function FavoriteTeamsDisplay() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    favoriteTeamsData, 
    isLoading, 
    addFavorite,
    removeFavorite, 
    isAdding,
    isRemoving 
  } = useFavoriteTeams();

  const { favoriteSports } = useFavoriteSports();

  const { 
    data: searchResults, 
    isLoading: isSearching 
  } = useEntitySearch<TeamSearchResult>({
    entityType: 'teams',
    query: searchQuery,
    enabled: showSearch && searchQuery.length >= 2,
    favoriteSportIds: favoriteSports,
  });

  const canAddMore = favoriteTeamsData.length < MAX_TEAMS;
  const existingTeamIds = favoriteTeamsData.map(t => t.id);

  const handleRemoveTeam = async (teamId: string, teamName: string) => {
    try {
      await removeFavorite(teamId);
      toast.success(`${teamName} removed from favorites`);
    } catch (error) {
      toast.error('Error removing team');
    }
  };

  const handleAddTeam = async (teamId: string, teamName: string) => {
    if (!canAddMore) {
      toast.error('Maximum 5 teams allowed');
      return;
    }
    if (existingTeamIds.includes(teamId)) {
      toast.error('Team already in favorites');
      return;
    }
    try {
      await addFavorite(teamId);
      toast.success(`${teamName} added to favorites`);
      setSearchQuery('');
      if (favoriteTeamsData.length + 1 >= MAX_TEAMS) {
        setShowSearch(false);
      }
    } catch (error) {
      toast.error('Error adding team');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">My favorite teams</label>
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">My favorite teams</label>
        <span className="text-sm text-muted-foreground">
          {favoriteTeamsData.length}/{MAX_TEAMS} teams
        </span>
      </div>

      {favoriteTeamsData.length > 0 && (
        <div className="space-y-2">
          {favoriteTeamsData.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3">
                {team.logo ? (
                  <img 
                    src={team.logo} 
                    alt={`${team.name} logo`}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=random`;
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{team.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {team.sport && <span>{team.sport.name}</span>}
                    {team.sport && team.country && <span>•</span>}
                    {team.country && <span>{team.country}</span>}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveTeam(team.id, team.name)}
                disabled={isRemoving}
                className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {canAddMore ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(true)}
          className="w-full gap-2"
          disabled={isAdding}
        >
          <Plus className="w-4 h-4" />
          Add a team
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          Maximum of 5 teams reached
        </p>
      )}

      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a team</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for a team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {isSearching && (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              )}

              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No teams found
                </p>
              )}

              {!isSearching && searchResults.map((team) => {
                const isAlreadyFavorite = existingTeamIds.includes(team.id);
                return (
                  <div
                    key={team.id}
                    className={`flex items-center justify-between p-3 rounded-lg border border-border ${
                      isAlreadyFavorite ? 'opacity-50' : 'hover:bg-accent cursor-pointer'
                    }`}
                    onClick={() => !isAlreadyFavorite && handleAddTeam(team.id, team.name)}
                  >
                    <div className="flex items-center gap-3">
                      {team.logo ? (
                        <img 
                          src={team.logo} 
                          alt={team.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{team.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {team.sport_name && <span>{team.sport_name}</span>}
                          {team.sport_name && team.country_name && <span>•</span>}
                          {team.country_name && <span>{team.country_name}</span>}
                        </div>
                      </div>
                    </div>
                    {isAlreadyFavorite && (
                      <span className="text-xs text-muted-foreground">Already added</span>
                    )}
                  </div>
                );
              })}

              {searchQuery.length < 2 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Type at least 2 characters to search
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
