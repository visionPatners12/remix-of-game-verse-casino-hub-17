import React, { useState } from 'react';
import { useNavigation, useGames } from '@azuro-org/sdk';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button, Badge } from '@/ui';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Sparkles, Trophy, Target, ArrowLeft } from 'lucide-react';
import { OddsSelectionView } from './OddsSelectionView';
import { useSports } from '@/hooks/useSports';
import type { GamesQuery } from '@azuro-org/toolkit';
import type { PredictionSelection } from '@/types';

type AzuroGame = GamesQuery['games'][0];

interface PredictionMatchSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectionConfirm: (selection: PredictionSelection) => void;
  mode?: 'prediction' | 'opinion';
}

export function PredictionMatchSelector({ 
  open, 
  onOpenChange, 
  onSelectionConfirm,
  mode = 'prediction'
}: PredictionMatchSelectorProps) {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedSportName, setSelectedSportName] = useState<string>('');
  const [selectedLeagueName, setSelectedLeagueName] = useState<string>('');

  // Sports data with real icons
  const { data: sportsWithIcons = [] } = useSports();

  // Navigation data for leagues
  const { data: navigation } = useNavigation({
    chainId: 137,
  });

  // Games data
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

  const handleSelectionConfirm = (selection: PredictionSelection) => {
    onSelectionConfirm(selection);
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset all selections
    setSelectedSport(null);
    setSelectedLeague(null);
    setSelectedMatchId(null);
    setSelectedSportName('');
    setSelectedLeagueName('');
  };

  const handleBack = () => {
    if (selectedMatchId) {
      setSelectedMatchId(null);
    } else if (selectedLeague) {
      setSelectedLeague(null);
      setSelectedLeagueName('');
    } else if (selectedSport) {
      setSelectedSport(null);
      setSelectedSportName('');
    }
  };

  // Show odds selection view
  if (selectedMatchId) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 border border-border/50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <OddsSelectionView
            matchId={selectedMatchId}
            sport={selectedSportName}
            league={selectedLeagueName}
            onBack={handleBack}
            onSelectionConfirm={handleSelectionConfirm}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Show matches for selected league
  if (selectedSport && selectedLeague && navigation) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] border border-border/50 animate-in slide-in-from-right-10 duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <DialogHeader className="relative pb-4 border-b border-border/50">
            <DialogTitle className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="hover:bg-accent/50 hover:scale-105 transition-all duration-200 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-2 flex-1">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-base">
                    Matchs disponibles
                  </span>
                  <span className="text-xs text-muted-foreground">{selectedLeagueName}</span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[550px] pr-4">
            <div className="relative space-y-3 p-2">
              {games.length === 0 ? (
                <div className="text-center py-24 animate-in fade-in-0 duration-500">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 flex items-center justify-center shadow-inner backdrop-blur-sm border border-border/30">
                    <Trophy className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Aucun match disponible</h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-sm">
                    Il n'y a pas de matchs programmés pour cette ligue actuellement. 
                    Revenez plus tard pour découvrir de nouveaux matchs.
                  </p>
                </div>
              ) : (
                games.map((match, index) => (
                  <div
                    key={match.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:bg-card/80 cursor-pointer transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4"
                    onClick={() => {
                      if (mode === 'opinion') {
                        // Pour les opinions, confirmer directement la sélection du match
                        const selection: PredictionSelection = {
                          matchId: match.id,
                          selectedOutcome: null,
                          market: null,
                          prediction: {
                            matchTitle: `${match.participants[0]?.name} vs ${match.participants[1]?.name}`,
                            predictionText: '',
                            odds: 0,
                            sport: selectedSportName,
                            league: selectedLeagueName,
                          },
                          // Native Azuro data (no wrapper)
                          gameId: match.id,
                          conditionId: '',
                          outcomeId: '',
                          startsAt: match.startsAt,
                          participants: match.participants,
                        };
                        onSelectionConfirm(selection);
                        handleClose();
                      } else {
                        setSelectedMatchId(match.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <Target className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex items-center gap-2 font-semibold text-base">
                            <span className="truncate">{match.participants[0]?.name}</span>
                            <span className="text-muted-foreground font-normal text-sm">vs</span>
                            <span className="truncate">{match.participants[1]?.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-10">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{selectedLeagueName}</span>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="px-3 py-1.5 rounded-lg bg-accent/50 backdrop-blur-sm border border-border/30 mb-1.5">
                          <div className="text-sm font-semibold">
                            {new Date(Number(match.startsAt) * 1000).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(Number(match.startsAt) * 1000).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
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

  // Show leagues for selected sport
  if (selectedSport && !selectedLeague && navigation) {
    const selectedSportData = navigation.find(s => s.slug === selectedSport);
    const allLeagues = selectedSportData?.countries?.flatMap(country => 
      country.leagues?.map(league => ({ ...league, countryName: country.name })) || []
    ) || [];
    
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] border border-border/50 animate-in slide-in-from-right-10 duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <DialogHeader className="relative pb-4 border-b border-border/50">
            <DialogTitle className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="hover:bg-accent/50 hover:scale-105 transition-all duration-200 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-2 flex-1">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-base">
                    Ligues disponibles
                  </span>
                  <span className="text-xs text-muted-foreground">{selectedSportName}</span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[550px] pr-4">
            <div className="relative grid grid-cols-1 gap-3 p-2">
              {allLeagues.map((league, index) => (
                <div
                  key={league.slug}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:bg-card/80 cursor-pointer transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4"
                  onClick={() => {
                    setSelectedLeague(league.slug);
                    setSelectedLeagueName(league.name);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {league.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{league.countryName}</span>
                        </div>
                      </div>
                    </div>
                    
                    {league.activeGamesCount > 0 && (
                      <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-primary/10 text-primary border-primary/20">
                        {league.activeGamesCount} matchs
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // Show sports selection
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] border border-border/50 animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <DialogHeader className="relative pb-5 border-b border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Choisir un sport
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'opinion' 
              ? 'Sélectionnez le sport pour partager votre opinion' 
              : 'Sélectionnez le sport pour lequel vous voulez faire un pronostic'
            }
          </p>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="relative space-y-3 p-2">
            {sportsWithIcons
              .filter(sport => {
                // Find matching navigation sport to check availability
                const navigationSport = navigation?.find(navSport => navSport.slug === sport.slug);
                return navigationSport && navigationSport.countries?.some(country => country.leagues?.length > 0);
              })
              .map((sport, index) => {
                // Get league count from navigation data
                const navigationSport = navigation?.find(navSport => navSport.slug === sport.slug);
                const leagueCount = navigationSport?.countries?.reduce((total, country) => total + (country.leagues?.length || 0), 0) || 0;
                const IconComponent = sport.icon;
                
                return (
                  <div
                    key={sport.slug}
                    style={{ animationDelay: `${index * 30}ms` }}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/60 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4"
                    onClick={() => {
                      setSelectedSport(sport.slug);
                      setSelectedSportName(sport.name);
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground truncate">
                        {sport.name}
                      </h3>
                      {leagueCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {leagueCount} ligues disponibles
                        </p>
                      )}
                    </div>
                    
                    {leagueCount > 0 && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0 px-2.5 py-1 bg-primary/10 text-primary border-primary/20">
                        {leagueCount}
                      </Badge>
                    )}
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
