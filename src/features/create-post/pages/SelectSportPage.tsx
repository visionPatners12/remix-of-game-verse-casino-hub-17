/**
 * @deprecated This page is deprecated and will be removed in a future version.
 * The match/market selection flow is being replaced with a new system.
 */
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNavigation } from '@azuro-org/sdk';
import { useSports } from '@/hooks/useSports';

export default function SelectSportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const { data: sportsWithIcons = [] } = useSports();
  const { data: navigation } = useNavigation({ chainId: 137 });

  // Save mode to sessionStorage if provided
  React.useEffect(() => {
    if (mode) {
      sessionStorage.setItem('postMode', mode);
    }
  }, [mode]);

  const handleSportSelect = (sportSlug: string, sportName: string) => {
    sessionStorage.setItem('selectedSport', sportSlug);
    sessionStorage.setItem('selectedSportName', sportName);
    navigate(`/create-post/select-league?sport=${sportSlug}`);
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
            onClick={() => navigate('/create-post')}
            className="p-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-base font-semibold">Choisir un sport</h1>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto">
          {sportsWithIcons
            .filter(sport => {
              const navigationSport = navigation?.find(navSport => navSport.slug === sport.slug);
              return navigationSport && navigationSport.countries?.some(country => country.leagues?.length > 0);
            })
            .map((sport) => {
              const navigationSport = navigation?.find(navSport => navSport.slug === sport.slug);
              const leagueCount = navigationSport?.countries?.reduce((total, country) => total + (country.leagues?.length || 0), 0) || 0;
              const IconComponent = sport.icon;

              return (
                <div
                  key={sport.slug}
                  className="flex items-center gap-3 p-3 border-b bg-background active:bg-accent/50 cursor-pointer"
                  onClick={() => handleSportSelect(sport.slug, sport.name)}
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {sport.name}
                    </h3>
                    {leagueCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {leagueCount} leagues
                      </p>
                    )}
                  </div>

                  {leagueCount > 0 && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {leagueCount}
                    </Badge>
                  )}
                </div>
              );
            })}
        </div>
      </ScrollArea>
      </div>
    </Layout>
  );
}
