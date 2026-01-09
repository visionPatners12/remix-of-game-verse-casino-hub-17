/**
 * @deprecated This page is deprecated and will be removed in a future version.
 * The match/market selection flow is being replaced with a new system.
 */
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trophy, MapPin, Target } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGames } from '@azuro-org/sdk';
import type { PredictionSelection } from '@/types';

export default function SelectMatchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sportSlug = searchParams.get('sport');
  const leagueSlug = searchParams.get('league');
  const mode = sessionStorage.getItem('postMode') || 'prediction';

  const sportName = sessionStorage.getItem('selectedSportName') || '';
  const leagueName = sessionStorage.getItem('selectedLeagueName') || '';

  const { data: games = [] } = useGames({
    filter: {
      sportSlug: sportSlug || undefined,
      leagueSlug: leagueSlug || undefined,
    },
    chainId: 137,
    query: {
      enabled: !!sportSlug && !!leagueSlug,
    },
  });

  useEffect(() => {
    if (!sportSlug || !leagueSlug) {
      navigate('/create-post/select-sport');
    }
  }, [sportSlug, leagueSlug, navigate]);

  const handleMatchSelect = (match: any) => {
    if (mode === 'opinion') {
      // Pour les opinions, sauvegarder et retourner directement
      const selection = {
        matchTitle: `${match.participants[0]?.name} vs ${match.participants[1]?.name}`,
        sport: sportName,
        league: leagueName,
      };
      sessionStorage.setItem('selectedMatch', JSON.stringify(selection));
      navigate('/create-post');
    } else {
      // Pour les prédictions, continuer vers la sélection des cotes
      sessionStorage.setItem('selectedMatchId', match.id);
      navigate(`/create-post/select-odds?sport=${sportSlug}&league=${leagueSlug}&match=${match.id}`);
    }
  };

  return (
    <Layout hideNavigation={true}>
      <div style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center gap-2 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/create-post/select-league?sport=${sportSlug}`)}
            className="p-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-base font-semibold">Choisir un match</h1>
            <p className="text-xs text-muted-foreground">{leagueName}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto">
          {games.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-base font-semibold mb-2">No matches available</h3>
              <p className="text-sm text-muted-foreground">
                No scheduled matches for this league
              </p>
            </div>
          ) : (
            games.map((match) => (
              <div
                key={match.id}
                className="p-3 border-b bg-background active:bg-accent/50 cursor-pointer"
                onClick={() => handleMatchSelect(match)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1 truncate">
                      {match.participants[0]?.name} <span className="text-muted-foreground font-normal">vs</span> {match.participants[1]?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {leagueName}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 text-xs">
                    <div className="font-medium">
                      {new Date(Number(match.startsAt) * 1000).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(Number(match.startsAt) * 1000).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      </div>
    </Layout>
  );
}
