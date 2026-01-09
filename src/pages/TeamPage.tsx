import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

// Import components
import { InstagramStyleHeader } from '@/features/profile/team/components/InstagramStyleHeader';
import { CompetitionSelector } from '@/features/profile/team/components/CompetitionSelector';
import { TeamStandingsSection } from '@/features/profile/team/components/TeamStandingsSection';
import { TeamMatchesContent } from '@/features/profile/team/components/TeamMatchesContent';
import { EntityFeed } from '@/features/highlights/components/EntityFeed';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/ui/PullToRefreshIndicator';
import { TeamPageSkeleton } from '@/components/ui/page-skeletons';
import { DetailPageHeader } from '@/components/shared/DetailPageHeader';
import { SportsSEOHead } from '@/components/seo/SportsSEOHead';
import { WebInstallBanner } from '@/components/web';

// Import hooks
import { useTeam } from '@/features/profile/team/hooks';
import { useEntityFollow } from '@/hooks/useEntityFollow';
import { useViewTracking } from '@/hooks/useViewTracking';

// Import service functions
import { getTeamLeagues, getTeamStanding } from '@/services/teamServiceV2';

// Import types
import { TeamGlobalParams, FootballApiLeague } from '@/types/footballApi';

// Import SEO URL utilities
import { buildTeamUrl } from '@/utils/seoUrls';

export default function TeamPage() {
  const { t } = useTranslation('pages');
  // Support both new SEO format (/team/:sport/:slug/:teamId) and legacy (/team/:teamSlug)
  const { teamId, teamSlug } = useParams<{ teamId?: string; teamSlug?: string; sport?: string; slug?: string }>();
  const resolvedTeamId = teamId || teamSlug || '';
  
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<'matches' | 'standings' | 'feed'>('standings');

  // Global parameters
  const [globalParams, setGlobalParams] = useState<TeamGlobalParams>({
    team_id: '',
    season: '2023',
    league_id: undefined
  });

  // Use the corrected useTeam hook
  const { team: teamProfile, loading: teamLoading, error: teamError } = useTeam(resolvedTeamId);

  // Track page views
  useViewTracking('team', teamProfile?.id);

  // Entity follow hook for team following
  const { isFollowing, followersCount, toggleFollow, isToggling } = useEntityFollow({
    entityType: 'team',
    teamId: teamProfile?.id
  });

  // Loading and error states for other data
  const [additionalLoading, setAdditionalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [availableLeagues, setAvailableLeagues] = useState<FootballApiLeague[]>([]);
  const [teamStanding, setTeamStanding] = useState<{ rank?: number; points?: number } | null>(null);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['team', resolvedTeamId] });
    await queryClient.invalidateQueries({ queryKey: ['supabase-games'] });
    await queryClient.invalidateQueries({ queryKey: ['standings'] });
  }, [queryClient, resolvedTeamId]);

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    disabled: !isMobile,
  });

  // Use resolvedTeamId directly as team_id
  useEffect(() => {
    if (!resolvedTeamId) {
      setError('Team slug missing');
      return;
    }

    setGlobalParams(prev => ({
      ...prev,
      team_id: resolvedTeamId
    }));
  }, [resolvedTeamId]);

  // Initial data loading
  useEffect(() => {
    if (globalParams.team_id && teamProfile) {
      loadInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalParams.team_id, globalParams.season, teamProfile]);

  // League-dependent data loading
  useEffect(() => {
    if (globalParams.league_id) {
      loadLeagueDependentData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalParams.league_id]);

  const loadInitialData = async () => {
    try {
      setAdditionalLoading(true);
      setError(null);

      const leaguesData = await getTeamLeagues(globalParams);
      setAvailableLeagues(leaguesData);

      if (leaguesData.length > 0 && leaguesData[0]?.id && !globalParams.league_id) {
        const latestSeason = leaguesData[0].season?.toString() || new Date().getFullYear().toString();
        setGlobalParams(prev => ({
          ...prev,
          season: latestSeason,
          league_id: leaguesData[0].id.toString()
        }));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setAdditionalLoading(false);
    }
  };

  const loadLeagueDependentData = async () => {
    try {
      const standingData = await getTeamStanding(globalParams);
      setTeamStanding(standingData);
    } catch (err) {
      console.error('Error loading league-dependent data:', err);
    }
  };

  const handleLeagueChange = (leagueId: string) => {
    setGlobalParams(prev => ({
      ...prev,
      league_id: leagueId
    }));
  };

  const handleFollow = () => toggleFollow();


  const handleBack = () => {
    if (location.state?.from === 'staff') {
      navigate(-2);
    } else if (window.history.length <= 2) {
      navigate('/dashboard');
    } else {
      navigate(-1);
    }
  };

  // Navigate to staff page with SEO-friendly URL
  const handleStaffClick = () => {
    if (teamProfile) {
      const teamUrl = buildTeamUrl({
        id: teamProfile.id,
        slug: (teamProfile as any).slug,
        name: teamProfile.name,
        sport_slug: (teamProfile as any).sport_slug
      });
      navigate(`${teamUrl}/staff`);
    }
  };

  if (teamLoading || additionalLoading) {
    return (
      <Layout hideNavigation={isMobile}>
        <TeamPageSkeleton />
      </Layout>
    );
  }

  if (teamError || error || !teamProfile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {teamError || error || t('common.notFound')}
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  const selectedLeague = availableLeagues.find(
    league => league.id.toString() === globalParams.league_id
  );

  return (
    <Layout hideNavigation={isMobile}>
      <SportsSEOHead 
        pageType="team" 
        data={{ 
          team: { 
            id: teamProfile.id, 
            name: teamProfile.name, 
            slug: (teamProfile as any).slug || resolvedTeamId, 
            logo_url: teamProfile.logo_url,
            country: teamProfile.country,
            league: selectedLeague?.name,
            sport: (teamProfile as any).sport_name
          } 
        }} 
      />
      <div 
        ref={containerRef}
        className="w-full min-h-screen bg-background overflow-y-auto hide-scrollbar"
      >
        {/* Header with Back Button and Ticket Button */}
        <DetailPageHeader 
          onBack={handleBack} 
          sportSlug={(teamProfile as any).sport_slug}
          sportName={(teamProfile as any).sport_name}
        />

        {/* Pull to refresh indicator */}
        <PullToRefreshIndicator 
          pullDistance={pullDistance} 
          isRefreshing={isRefreshing} 
        />

        {/* Instagram-Style Header */}
        <InstagramStyleHeader
          team={{
            id: parseInt(teamProfile.id) || 0,
            name: teamProfile.name,
            logo: teamProfile.logo_url,
            country: teamProfile.country,
            founded: Number(teamProfile.founded_year) || 2000,
            national: false
          }}
          venue={{
            id: 1,
            name: teamProfile.stadium,
            address: '',
            city: teamProfile.country,
            capacity: 0,
            surface: '',
            image: ''
          }}
          followersCount={followersCount} 
          postsCount={teamProfile.stats.posts_count}
          position={teamStanding?.rank || teamProfile.stats.position}
          points={teamStanding?.points || teamProfile.stats.points}
          isFollowing={isFollowing}
          isToggling={isToggling}
          onFollow={handleFollow}
          onStaffClick={handleStaffClick}
        />

        {/* Competition Selector */}
        <CompetitionSelector
          selectedLeague={selectedLeague || null}
          availableLeagues={availableLeagues}
          onLeagueChange={handleLeagueChange}
          showAllButton={true}
        />

        {/* Navigation Tabs */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="px-1">
            <nav className="flex justify-center">
              <div className="flex space-x-6">
                <button 
                  onClick={() => setActiveSection('standings')}
                  className={cn(
                    "py-3 border-b-2 text-xs font-medium tracking-wider uppercase transition-colors",
                    activeSection === 'standings' 
                      ? "border-primary text-foreground font-semibold" 
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t('team.tabs.standings')}
                </button>
                <button 
                  onClick={() => setActiveSection('matches')}
                  className={cn(
                    "py-3 border-b-2 text-xs font-medium tracking-wider uppercase transition-colors",
                    activeSection === 'matches' 
                      ? "border-primary text-foreground font-semibold" 
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t('team.tabs.matches')}
                </button>
                <button 
                  onClick={() => setActiveSection('feed')}
                  className={cn(
                    "py-3 border-b-2 text-xs font-medium tracking-wider uppercase transition-colors",
                    activeSection === 'feed' 
                      ? "border-primary text-foreground font-semibold" 
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t('team.tabs.highlights')}
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[60vh]">
          {activeSection === 'standings' && (
            <TeamStandingsSection 
              teamId={globalParams.team_id}
              selectedLeagueId={globalParams.league_id || null}
            />
          )}
          
          {activeSection === 'matches' && (
            <TeamMatchesContent 
              teamId={teamProfile.id} 
              leagueId={globalParams.league_id}
            />
          )}
          
          
          {activeSection === 'feed' && teamProfile && (
            <EntityFeed entityType="team" entityId={teamProfile.id} />
          )}
        </div>
        
        {/* Install banner for web visitors */}
        <WebInstallBanner />
      </div>
    </Layout>
  );
}
