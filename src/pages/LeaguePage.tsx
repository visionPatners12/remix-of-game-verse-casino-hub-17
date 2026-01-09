import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useViewTracking } from '@/hooks/useViewTracking';
import { cn } from '@/lib/utils';
import { 
  LeagueHeader,
  LeagueStandings,
} from '@/features/profile/league/components';
import { LeagueMatchesContent } from '@/features/profile/league/components/LeagueMatchesContent';
import { EntityFeed } from '@/features/highlights/components/EntityFeed';
import { DetailPageHeader } from '@/components/shared/DetailPageHeader';
import React, { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQueryClient } from '@tanstack/react-query';
import { useLeagueProfile } from '@/features/profile/league/hooks/useLeagueProfile';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/ui/PullToRefreshIndicator';
import { LeaguePageSkeleton } from '@/components/ui/page-skeletons';
import { SportsSEOHead } from '@/components/seo/SportsSEOHead';
import { WebInstallBanner } from '@/components/web';



export function LeaguePage() {
  const { t } = useTranslation('pages');
  // Support both new SEO format (/league/:country/:slug/:leagueId) and legacy (/league/:leagueSlug)
  const { leagueId, leagueSlug } = useParams<{ leagueId?: string; leagueSlug?: string; country?: string; slug?: string }>();
  const resolvedLeagueId = leagueId || leagueSlug || '';
  
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  const { data: league, isLoading: loading, error } = useLeagueProfile(resolvedLeagueId);
  const [activeSection, setActiveSection] = useState<'standings' | 'matches' | 'feed'>('standings');
  const [matchCounts, setMatchCounts] = useState({ upcoming: 0, past: 0 });

  // Track page views
  useViewTracking('league', league?.id);
  
  const handleMatchCountUpdate = useCallback((upcoming: number, past: number) => {
    setMatchCounts({ upcoming, past });
  }, []);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['league-profile', resolvedLeagueId] });
    await queryClient.invalidateQueries({ queryKey: ['supabase-games'] });
    await queryClient.invalidateQueries({ queryKey: ['standings'] });
  }, [queryClient, resolvedLeagueId]);

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    disabled: !isMobile,
  });

  if (loading) {
    return (
      <Layout hideNavigation={isMobile}>
        <LeaguePageSkeleton />
      </Layout>
    );
  }

  if (error || !league) {
    return (
      <Layout hideNavigation={isMobile}>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {error?.message || t('common.notFound')}
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
      </Layout>
    );
  }

  const renderNavigation = () => (
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
            {t('league.tabs.standings')}
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
            {t('league.tabs.matches')} {matchCounts.upcoming > 0 && `(${matchCounts.upcoming})`}
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
            {t('league.tabs.highlights')}
          </button>
        </div>
      </nav>
    </div>
  );

  const renderContent = () => (
    <>
      {activeSection === 'standings' && (
        <div className="mt-0 space-y-0">
          <LeagueStandings league={league} />
        </div>
      )}
      
      {activeSection === 'matches' && (
        <LeagueMatchesContent leagueId={league.id} onCountUpdate={handleMatchCountUpdate} />
      )}
      
      
      {activeSection === 'feed' && (
        <EntityFeed entityType="league" entityId={league.id} />
      )}
    </>
  );

  if (isMobile) {
    return (
      <Layout hideNavigation={isMobile}>
        <SportsSEOHead 
          pageType="league" 
          data={{ 
            league: { 
              id: league.id, 
              name: league.name, 
              slug: league.slug || resolvedLeagueId, 
              logo: league.logo,
              country: league.country_name
            } 
          }} 
        />
        <div 
          ref={containerRef}
          className="min-h-screen bg-background overflow-y-auto hide-scrollbar"
        >
          {/* Mobile Header */}
          <DetailPageHeader 
            sportSlug={league.sport_slug}
            sportName={league.sport_name}
            countryName={league.country_name}
            countrySlug={league.country_slug}
          />
          
          {/* Pull to refresh indicator */}
          <PullToRefreshIndicator 
            pullDistance={pullDistance} 
            isRefreshing={isRefreshing} 
          />
          
          {/* Main content */}
          <div className="flex flex-col">
            {/* League Header compact */}
            <LeagueHeader league={league} />
            
            {/* Sticky Navigation */}
            <div 
              className="sticky z-40 bg-background/95 backdrop-blur-sm border-b border-border/20"
              style={{ top: 'calc(var(--safe-area-inset-top) + 52px)' }}
            >
              {renderNavigation()}
            </div>
            
            {/* Content */}
            <div className="min-h-[60vh]">
              {renderContent()}
            </div>
          </div>
          
          {/* Bottom safe area for iOS */}
          <div className="h-[env(safe-area-inset-bottom)] bg-background" />
          
          {/* Install banner for web visitors */}
          <WebInstallBanner />
        </div>
      </Layout>
    );
  }

  // Desktop version
  return (
    <Layout>
      <SportsSEOHead 
        pageType="league" 
        data={{ 
          league: { 
            id: league.id, 
            name: league.name, 
            slug: league.slug || resolvedLeagueId, 
            logo: league.logo,
            country: league.country_name
          } 
        }} 
      />
      <div className="w-full max-w-lg mx-auto overflow-y-auto hide-scrollbar">
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

        <LeagueHeader league={league} />
        
        {/* Sticky Navigation */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/20">
          {renderNavigation()}
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
}

export default LeaguePage;
