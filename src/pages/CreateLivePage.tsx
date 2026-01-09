
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Users, ArrowLeft, Plus, X, Video, Clock, Globe } from 'lucide-react';
import { LiveCreationForm } from '@/features/live/components/creation/LiveCreationForm';
import { MatchSelectionDialog } from '@/components/match-selection/MatchSelectionDialog';
import { useStreamCreation } from '@/features/live/hooks/useStreamCreation';
import { formatAzuroDate, azuroDateToISOString, getTeamInitials } from '@/utils/azuroDateUtils';
import type { GamesQuery } from '@azuro-org/toolkit';
import { useNavigate } from 'react-router-dom';

// Utiliser le type natif Game d'Azuro
type AzuroGame = GamesQuery['games'][0];

export default function CreateLivePage() {
  const navigate = useNavigate();
  const { setTitle, setDescription, setGameId } = useStreamCreation();
  const [selectedMatch, setSelectedMatch] = useState<AzuroGame | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);

  const handleMatchSelect = (match: AzuroGame) => {
    setSelectedMatch(match);
    
    // Pré-remplir automatiquement le titre et la description
    const matchTitle = `Live: ${match.participants[0]?.name} vs ${match.participants[1]?.name}`;
    setTitle(matchTitle);
    setDescription(`Live du match ${match.league?.name || ''} - ${match.participants[0]?.name} vs ${match.participants[1]?.name}`);
    if (match.gameId) {
      setGameId(match.gameId);
    }
  };

  const handleClearMatch = () => {
    setSelectedMatch(null);
    // Optionnellement, on peut vider les champs pré-remplis
    setTitle('');
    setDescription('');
    setGameId(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Navigation Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Créer un Live</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                En direct
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Configuration du Live
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bouton de sélection de match */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Match associé (optionnel)</label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start h-auto p-4 border-dashed"
                    onClick={() => setShowMatchDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Associer un match sportif
                  </Button>
                </div>

                <LiveCreationForm selectedMatch={selectedMatch} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Durée recommandée: 30-60 min</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Audience attendue: Publique</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>Qualité: HD automatique</span>
                </div>
              </CardContent>
            </Card>

            {/* Match sélectionné */}
            {selectedMatch && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Match sélectionné</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearMatch}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Équipes avec logos */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {selectedMatch.participants[0]?.image ? (
                          <img 
                            src={selectedMatch.participants[0].image} 
                            alt={selectedMatch.participants[0].name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium">
                            {getTeamInitials(selectedMatch.participants[0]?.name || '')}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-sm">
                        {selectedMatch.participants[0]?.name}
                      </span>
                    </div>
                    
                    <div className="text-center text-xs text-muted-foreground">VS</div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {selectedMatch.participants[1]?.image ? (
                          <img 
                            src={selectedMatch.participants[1].image} 
                            alt={selectedMatch.participants[1].name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium">
                            {getTeamInitials(selectedMatch.participants[1]?.name || '')}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-sm">
                        {selectedMatch.participants[1]?.name}
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Informations du match */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatAzuroDate(selectedMatch.startsAt)}</span>
                    </div>
                    
                    {selectedMatch.league?.name && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>🏆</span>
                        <span>{selectedMatch.league.name}</span>
                      </div>
                    )}
                    
                    <Badge variant="outline" className="text-xs">
                      {selectedMatch.state}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Conseils */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conseils</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>• Testez votre connexion avant de commencer</p>
                  <p>• Préparez votre contenu à l'avance</p>
                  <p>• Interagissez avec votre audience</p>
                  <p>• Respectez les règles de la communauté</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog de sélection de match */}
      <MatchSelectionDialog
        open={showMatchDialog}
        onOpenChange={setShowMatchDialog}
        onMatchSelect={handleMatchSelect}
      />
    </div>
  );
}
