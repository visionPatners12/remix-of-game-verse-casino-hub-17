
import React, { useState } from 'react';
import { useNavigation, useGames } from '@azuro-org/sdk';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Badge, ScrollArea, Avatar, AvatarImage, AvatarFallback, ThemeAvatarFallback } from '@/ui';
import { Calendar, MapPin, Users } from 'lucide-react';
import { DateTimeDisplay } from '@/features/sports/components/MatchCard/components/DateTimeDisplay';
import type { GamesQuery } from '@azuro-org/toolkit';

type AzuroGame = GamesQuery['games'][0];

interface MatchSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatchSelect: (match: AzuroGame) => void;
}

export function MatchSelectionDialog({ 
  open, 
  onOpenChange, 
  onMatchSelect 
}: MatchSelectionDialogProps) {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  // Récupérer la navigation des sports et ligues
  const { data: navigation } = useNavigation({
    chainId: 137,
  });

  // Récupérer les matchs pour le sport/ligue sélectionné
  const { data: games = [] } = useGames({
    filter: {
      sportSlug: selectedSport || undefined,
      leagueSlug: selectedLeague || undefined,
    },
    chainId: 137,
    query: {
      enabled: !!selectedSport,
    },
  });

  const handleMatchSelect = (match: AzuroGame) => {
    
    onMatchSelect(match);
    onOpenChange(false);
    // Reset selections
    setSelectedSport(null);
    setSelectedLeague(null);
  };

  const handleBack = () => {
    if (selectedLeague) {
      setSelectedLeague(null);
    } else if (selectedSport) {
      setSelectedSport(null);
    }
  };

  const TeamAvatar = ({ team, variant }: { team?: any; variant: "A" | "B" }) => (
    <Avatar className="w-8 h-8 ring-1 ring-border/20">
      <AvatarImage 
        src={team?.image} 
        alt={team?.name || `Équipe ${variant}`}
      />
      <AvatarFallback asChild>
        <ThemeAvatarFallback 
          name={team?.name || `Team ${variant}`}
          variant="team"
          size="sm"
        />
      </AvatarFallback>
    </Avatar>
  );

  // Display sports
  if (!selectedSport && navigation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select a Sport</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 gap-2 p-4">
              {navigation.map(sport => (
                <Button
                  key={sport.slug}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => setSelectedSport(sport.slug)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">{sport.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {sport.countries?.reduce((total, country) => total + (country.leagues?.length || 0), 0) || 0} leagues
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // Affichage des ligues pour le sport sélectionné
  if (selectedSport && !selectedLeague && navigation) {
    const selectedSportData = navigation.find(s => s.slug === selectedSport);
    const allLeagues = selectedSportData?.countries?.flatMap(country => 
      country.leagues?.map(league => ({ ...league, countryName: country.name })) || []
    ) || [];
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Retour
              </Button>
              Ligues - {selectedSportData?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 gap-2 p-4">
              {allLeagues.map(league => (
                <Button
                  key={league.slug}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => setSelectedLeague(league.slug)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">{league.name}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {league.countryName}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // Affichage des matchs pour la ligue sélectionnée
  if (selectedSport && selectedLeague) {
    const selectedSportData = navigation?.find(s => s.slug === selectedSport);
    const allLeagues = selectedSportData?.countries?.flatMap(country => 
      country.leagues?.map(league => ({ ...league, countryName: country.name })) || []
    ) || [];
    const selectedLeagueData = allLeagues.find(l => l.slug === selectedLeague);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Retour
              </Button>
              Matchs - {selectedLeagueData?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 gap-3 p-4">
              {games.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun match disponible pour cette ligue
                </div>
              ) : (
                games.map(match => (
                  <div
                    key={match.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleMatchSelect(match)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Team Logos */}
                        <div className="flex items-center gap-3">
                          <TeamAvatar team={match.participants[0]} variant="A" />
                          <span className="text-sm text-muted-foreground">vs</span>
                          <TeamAvatar team={match.participants[1]} variant="B" />
                        </div>
                        
                        {/* Team Names */}
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">
                            {match.participants[0]?.name} vs {match.participants[1]?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {selectedLeagueData?.name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <DateTimeDisplay 
                          startingAt={match.startsAt} 
                          viewMode="list"
                        />
                        <Badge variant="outline">{match.state}</Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
