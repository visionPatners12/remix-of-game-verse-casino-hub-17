/**
 * @deprecated This page is deprecated and will be removed in a future version.
 * The match/market selection flow is being replaced with a new system.
 */
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trophy, MapPin } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNavigation } from '@azuro-org/sdk';

export default function SelectLeaguePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sportSlug = searchParams.get('sport');
  const { data: navigation } = useNavigation({ chainId: 137 });

  const selectedSportData = navigation?.find(s => s.slug === sportSlug);
  const sportName = sessionStorage.getItem('selectedSportName') || '';
  
  const allLeagues = selectedSportData?.countries?.flatMap(country =>
    country.leagues?.map(league => ({ ...league, countryName: country.name })) || []
  ) || [];

  useEffect(() => {
    if (!sportSlug) {
      navigate('/create-post/select-sport');
    }
  }, [sportSlug, navigate]);

  const handleLeagueSelect = (leagueSlug: string, leagueName: string) => {
    sessionStorage.setItem('selectedLeague', leagueSlug);
    sessionStorage.setItem('selectedLeagueName', leagueName);
    navigate(`/create-post/select-match?sport=${sportSlug}&league=${leagueSlug}`);
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
            onClick={() => navigate('/create-post/select-sport')}
            className="p-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-base font-semibold">Choose a league</h1>
            <p className="text-xs text-muted-foreground">{sportName}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto">
          {allLeagues.map((league) => (
            <div
              key={league.slug}
              className="flex items-center justify-between p-3 border-b bg-background active:bg-accent/50 cursor-pointer"
              onClick={() => handleLeagueSelect(league.slug, league.name)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div>
                  <h3 className="font-medium text-sm">
                    {league.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{league.countryName}</span>
                  </div>
                </div>
              </div>

              {league.activeGamesCount > 0 && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {league.activeGamesCount}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      </div>
    </Layout>
  );
}
