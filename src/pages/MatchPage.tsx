import React, { useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, Button } from "@/ui";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { logger } from '@/utils/logger';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MatchDetailsContent, useSupabaseMatchData, useAzuroMarkets } from "@/features/match-details";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/ui/PullToRefreshIndicator";
import { MatchDetailsPageSkeleton } from "@/components/ui/page-skeletons";
import { SportsSEOHead } from "@/components/seo/SportsSEOHead";
import { WebInstallBanner } from "@/components/web";

export default function MatchDetails() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { matchId } = useParams<{ matchId: string }>();
  
  // Fetch match data from Supabase
  const { data: match, isLoading: matchLoading, error: matchError } = useSupabaseMatchData(matchId);
  
  // Fetch markets from Azuro only if we have an azuro_game_id
  const { markets, isLoading: marketsLoading, error: marketsError } = useAzuroMarkets(match?.azuro_game_id);
  
  const isLoading = matchLoading || marketsLoading;
  const error = matchError || marketsError;

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['supabase-match', matchId] });
    await queryClient.invalidateQueries({ queryKey: ['azuro-markets'] });
  }, [queryClient, matchId]);

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    disabled: !isMobile,
  });

  logger.debug(`📱 MatchDetails render:`, {
    matchId,
    hasMatch: !!match,
    hasAzuroGameId: !!match?.azuro_game_id,
    hasHomeLogo: !!match?.home_team?.logo,
    hasAwayLogo: !!match?.away_team?.logo,
    hasMarkets: markets.length > 0,
    isLoading,
    error: typeof error === 'string' ? error : error?.message
  });

  if (matchLoading) {
    return (
      <Layout hideNavigation>
        <MatchDetailsPageSkeleton />
      </Layout>
    );
  }

  if (matchError || !match) {
    const errorMessage = typeof matchError === 'string' ? matchError : matchError?.message || "Match not found";
    
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-destructive">{errorMessage}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Match ID: {matchId}</p>
                <p>Please check if the match ID is correct</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/sports')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sports
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavigation>
      <SportsSEOHead 
        pageType="match" 
        data={{ 
          match: { 
            id: matchId || '', 
            home_team: match.home_team ? { name: match.home_team.name, logo: match.home_team.logo } : undefined,
            away_team: match.away_team ? { name: match.away_team.name, logo: match.away_team.logo } : undefined,
            league: match.league ? { name: (match.league as any).name || '', slug: (match.league as any).slug } : undefined,
            start_iso: match.start_iso,
            sport: match.sport?.name
          } 
        }} 
      />
      <div 
        ref={containerRef}
        className="min-h-screen bg-background overflow-y-auto hide-scrollbar"
      >
        <PullToRefreshIndicator
          pullDistance={pullDistance} 
          isRefreshing={isRefreshing} 
        />
        <ErrorBoundary>
          <MatchDetailsContent match={match} markets={markets} />
        </ErrorBoundary>
      </div>
      
      {/* Install banner for web visitors */}
      <WebInstallBanner />
    </Layout>
  );
}
