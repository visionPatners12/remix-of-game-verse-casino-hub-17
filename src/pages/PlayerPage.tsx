import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQueryClient } from '@tanstack/react-query';
import { MobileMenuHeader } from '@/components/mobile/MobileMenuHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  PlayerInstagramHeader,
  PlayerSeasonHighlights,
  PlayerBioGrid,
  PlayerTeamCard,
  PlayerCareerStats,
  PlayerFeed,
  PlayerMarketValue,
  PlayerTransfers,
  PlayerClubCard,
  usePlayerProfile,
  FootballCareerStats
} from '@/features/profile/player';
import { useEntityFollow } from '@/hooks/useEntityFollow';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useViewTracking } from '@/hooks/useViewTracking';
import { PullToRefreshIndicator } from '@/components/ui/PullToRefreshIndicator';
import { PlayerPageSkeleton } from '@/components/ui/page-skeletons';
import { SportsSEOHead } from '@/components/seo/SportsSEOHead';

type ActiveSection = 'overview' | 'stats' | 'feed';

export default function PlayerPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { player, stats, isLoading, error } = usePlayerProfile(playerId || '');
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  
  const { isFollowing, followersCount, toggleFollow, isToggling } = useEntityFollow({
    entityType: 'player',
    playerId: player?.id,
  });

  // Track page views
  useViewTracking('player', playerId);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['player-profile', playerId] });
    await queryClient.invalidateQueries({ queryKey: ['player-stats', playerId] });
  }, [queryClient, playerId]);

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    disabled: !isMobile,
  });

  if (isLoading) {
    return (
      <Layout hideNavigation={isMobile}>
        <PlayerPageSkeleton />
      </Layout>
    );
  }

  if (error || !player) {
    return (
      <Layout hideNavigation={isMobile}>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Failed to load player profile</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </Layout>
    );
  }

  const NavTabs = () => (
    <nav className="flex justify-center">
      <div className="flex space-x-6">
        {(['overview', 'stats', 'feed'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={cn(
              "py-3 border-b-2 text-xs font-medium tracking-wider uppercase transition-colors",
              activeSection === section
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {section}
          </button>
        ))}
      </div>
    </nav>
  );

  const isFootball = player.sportSlug === 'football' || player.sportSlug === 'Football';

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Player Info */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Player Info
        </h3>
        <PlayerBioGrid player={player} />
      </div>

      {/* Current Team (Basketball/other sports) */}
      {!isFootball && player.profile?.team && player.profile.team.name !== 'Free Agent' && (
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Current Team
          </h3>
          <PlayerTeamCard team={player.profile.team} />
        </div>
      )}

      {/* Current Club (Football) */}
      {isFootball && player.profile?.club && (
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Current Club
          </h3>
          <PlayerClubCard club={player.profile.club} />
        </div>
      )}

      {/* Market Value (Football) */}
      {isFootball && player.marketValue && player.marketValue.length > 0 && (
        <PlayerMarketValue data={player.marketValue} />
      )}

      {/* Transfer History (Football) */}
      {isFootball && player.transfers && player.transfers.length > 0 && (
        <PlayerTransfers transfers={player.transfers} />
      )}

      {/* Season Highlights (Basketball/other sports with stats) */}
      {!isFootball && stats?.perSeason?.length ? (
        <PlayerSeasonHighlights stats={stats} />
      ) : null}
    </div>
  );

  const StatsContent = () => {
    // Football stats
    if (isFootball) {
      const hasFootballStats = stats?.perCompetition?.length || stats?.perClub?.length;
      if (hasFootballStats) {
        return <FootballCareerStats stats={stats} />;
      }
    }
    
    // NBA/Basketball stats
    if (stats?.perSeason?.length) {
      return <PlayerCareerStats stats={stats} />;
    }

    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No statistics available for this player.
        </CardContent>
      </Card>
    );
  };

  // Mobile layout
  if (isMobile) {
    return (
      <Layout hideNavigation={isMobile}>
        <SportsSEOHead 
          pageType="player" 
          data={{ 
            player: { 
              id: playerId || '', 
              name: player.name || player.fullName || '', 
              logo: player.logo,
              position: player.profile?.position?.toString(),
              team: player.profile?.team?.name || (player.profile?.club as any)?.team_name,
              sport: player.sportSlug
            } 
          }} 
        />
        <div 
          ref={containerRef}
          className="min-h-screen bg-background overflow-y-auto hide-scrollbar"
        >
          {/* Sticky header */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
            <MobileMenuHeader onBack={() => navigate(-1)} />
          </div>

          {/* Pull to refresh indicator */}
          <PullToRefreshIndicator 
            pullDistance={pullDistance} 
            isRefreshing={isRefreshing} 
          />

          {/* Player Header */}
          <PlayerInstagramHeader 
            player={player} 
            stats={stats}
            isFollowing={isFollowing}
            followersCount={followersCount}
            onFollow={toggleFollow}
            isToggling={isToggling}
          />

          {/* Sticky Navigation */}
          <div className="sticky top-[60px] z-40 bg-background/95 backdrop-blur-sm border-b">
            <div className="px-1">
              <NavTabs />
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[60vh]">
            {activeSection === 'overview' && (
              <div className="px-4 py-4">
                <OverviewContent />
              </div>
            )}

            {activeSection === 'stats' && (
              <div className="px-4 py-4">
                <StatsContent />
              </div>
            )}

            {activeSection === 'feed' && (
              <PlayerFeed player={player} />
            )}
          </div>

          {/* Bottom safe area for iOS */}
          <div className="h-[env(safe-area-inset-bottom)] bg-background" />
        </div>
      </Layout>
    );
  }

  // Desktop layout
  return (
    <Layout>
      <SportsSEOHead 
        pageType="player" 
        data={{ 
          player: { 
            id: playerId || '', 
            name: player.name || player.fullName || '', 
            logo: player.logo,
            position: player.profile?.position?.toString(),
            team: player.profile?.team?.name || (player.profile?.club as any)?.team_name,
            sport: player.sportSlug
          } 
        }} 
      />
      <div className="w-full max-w-lg mx-auto overflow-y-auto hide-scrollbar">
        {/* Back button */}
        <div className="flex items-center mb-6 px-4 pt-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Player Header */}
        <PlayerInstagramHeader 
          player={player} 
          stats={stats}
          isFollowing={isFollowing}
          followersCount={followersCount}
          onFollow={toggleFollow}
          isToggling={isToggling}
        />

        {/* Sticky Navigation */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
          <div className="px-1">
            <NavTabs />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {activeSection === 'overview' && <OverviewContent />}
          {activeSection === 'stats' && <StatsContent />}
          {activeSection === 'feed' && <PlayerFeed player={player} />}
        </div>
      </div>
    </Layout>
  );
}
