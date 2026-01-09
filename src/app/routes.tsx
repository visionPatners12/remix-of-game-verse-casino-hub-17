import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { protectedRoutes } from '@/config/protectedRoutes';
import { lazyWithRetry } from '@/utils/lazyWithRetry';
import { ChunkErrorBoundary } from '@/components/common/ChunkErrorBoundary';

// Critical pages loaded immediately
import { LandingHome } from '@/features/landing';
import Auth from '@/pages/Auth';
import Auth2 from '@/pages/Auth2';
import NotFound from '@/pages/NotFound';

// Loading fallback - affiché DANS le shell, pas à la place
const PageLoader = () => (
  <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lazy loaded pages with retry
const Dashboard = lazyWithRetry(() => import('@/pages/Dashboard'));
const PublicHome = lazyWithRetry(() => import('@/pages/PublicHome'));
const News = lazyWithRetry(() => import('@/pages/News'));
const TokenConfirmation = lazyWithRetry(() => import('@/pages/TokenConfirmation'));
const About = lazyWithRetry(() => import('@/pages/About'));
const AboutUs = lazyWithRetry(() => import('@/pages/AboutUs'));
const Legal = lazyWithRetry(() => import('@/pages/Legal'));
const FAQ = lazyWithRetry(() => import('@/pages/FAQ'));
const Support = lazyWithRetry(() => import('@/pages/Support'));
const Terms = lazyWithRetry(() => import('@/pages/Terms'));
const Privacy = lazyWithRetry(() => import('@/pages/Privacy'));
const Press = lazyWithRetry(() => import('@/pages/Press'));
const Refer = lazyWithRetry(() => import('@/pages/Refer'));
const ReferralRedirect = lazyWithRetry(() => import('@/pages/ReferralRedirect'));
const ShareTarget = lazyWithRetry(() => import('@/pages/ShareTarget'));
const ProtocolHandler = lazyWithRetry(() => import('@/pages/ProtocolHandler'));
const ResponsibleGaming = lazyWithRetry(() => import('@/pages/ResponsibleGaming'));
const WalletDebug = lazyWithRetry(() => import('@/pages/WalletDebug'));
const ResetPassword = lazyWithRetry(() => import('@/pages/ResetPassword'));
const HowToAddFunds = lazyWithRetry(() => import('@/pages/HowToAddFunds'));
const TeamPage = lazyWithRetry(() => import('@/pages/TeamPage'));
const PlayerPage = lazyWithRetry(() => import('@/pages/PlayerPage'));
const StreamerDashboard = lazyWithRetry(() => import('@/pages/StreamerDashboard'));
const CreatePolymarketPrediction = lazyWithRetry(() => import('@/pages/CreatePolymarketPrediction'));

// Public SEO pages
const OptimizedSports = lazyWithRetry(() => import('@/pages/OptimizedSports'));
const MatchPage = lazyWithRetry(() => import('@/pages/MatchPage'));
const OnboardingRouter = lazyWithRetry(() => import('@/features/onboarding').then(m => ({ default: m.OnboardingRouter })));
const TeamStaffPage = lazyWithRetry(() => import('@/pages/TeamStaffPage').then(m => ({ default: m.TeamStaffPage })));
const NFTDetailPage = lazyWithRetry(() => import('@/features/nft').then(m => ({ default: m.NFTDetailPage })));
const StreamHostPage = lazyWithRetry(() => import('@/features/live/components/host/StreamHostPage'));
const StreamViewerPage = lazyWithRetry(() => import('@/features/live/components/viewer/StreamViewerPage'));
const LudoKonva = lazyWithRetry(() => import('@/features/ludo').then(m => ({ default: m.LudoKonva })));
const LudoCreateGamePage = lazyWithRetry(() => import('@/features/ludo').then(m => ({ default: m.LudoCreateGamePage })));
const LeaguePage = lazyWithRetry(() => import('@/pages/LeaguePage').then(m => ({ default: m.LeaguePage })));
const Polymarket = lazyWithRetry(() => import('@/pages/Polymarket'));
const PolymarketEventDetail = lazyWithRetry(() => import('@/pages/PolymarketEventDetail'));
const SwapPage = lazyWithRetry(() => import('@/pages/SwapPage'));

// Lazy loaded landing pages with retry
const DiscoverFeed = lazyWithRetry(() => import('@/features/landing').then(m => ({ default: m.DiscoverFeed })));
const DiscoverForFan = lazyWithRetry(() => import('@/features/landing').then(m => ({ default: m.DiscoverForFan })));
const DiscoverSports = lazyWithRetry(() => import('@/features/landing').then(m => ({ default: m.DiscoverSports })));
const DiscoverWeb3 = lazyWithRetry(() => import('@/features/landing').then(m => ({ default: m.DiscoverWeb3 })));
const DiscoverGaming = lazyWithRetry(() => import('@/features/landing').then(m => ({ default: m.DiscoverGaming })));
const DiscoverPolymarket = lazyWithRetry(() => import('@/features/landing').then(m => ({ default: m.DiscoverPolymarket })));
const RoadmapPage = lazyWithRetry(() => import('@/features/landing').then(m => ({ default: m.RoadmapPage })));

// Components
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PublicRoute } from '@/components/PublicRoute';

export function AppRoutes() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing route - redirects authenticated users to dashboard */}
        <Route path="/" element={
          <PublicRoute>
            <LandingHome />
          </PublicRoute>
        } />
        
        {/* Auth routes - critical */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth2" element={<Auth2 />} />
        <Route path="/auth/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
        
        {/* Lazy loaded landing pages */}
        <Route path="/discover/feed" element={<DiscoverFeed />} />
        <Route path="/discover/forfan" element={<DiscoverForFan />} />
        <Route path="/discover/sports" element={<DiscoverSports />} />
        <Route path="/discover/web3" element={<DiscoverWeb3 />} />
        <Route path="/discover/gaming" element={<DiscoverGaming />} />
        <Route path="/discover/polymarket" element={<DiscoverPolymarket />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        
        {/* Public routes - lazy loaded */}
        <Route path="/home" element={<PublicHome />} />
        <Route path="/news" element={<News />} />
        <Route path="/token-confirmation" element={<TokenConfirmation />} />
        <Route path="/about" element={<About />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
        <Route path="/press" element={<Press />} />
        <Route path="/refer" element={<Refer />} />
        <Route path="/r/:code" element={<ReferralRedirect />} />
        <Route path="/share-target" element={<ShareTarget />} />
        <Route path="/protocol-handler" element={<ProtocolHandler />} />
        <Route path="/how-to-add-funds" element={<HowToAddFunds />} />
        
        <Route path="/wallet-debug" element={<WalletDebug />} />
        <Route path="/ludo-konva" element={<LudoKonva />} />
        <Route path="/swap" element={<SwapPage />} />
        
        {/* Game routes */}
        <Route path="/games/ludo/create" element={<LudoCreateGamePage />} />
        <Route path="/games/ludo/play/:gameId" element={<LudoKonva />} />
        
        {/* NFT Detail route */}
        <Route path="/nft-details" element={<NFTDetailPage />} />
        
        {/* Onboarding routes */}
        <Route path="/onboarding/*" element={
          <ProtectedRoute>
            <OnboardingRouter />
          </ProtectedRoute>
        } />
        
        {/* League routes - SEO friendly format (PUBLIC) */}
        <Route path="/league/:country/:slug/:leagueId" element={<LeaguePage />} />
        <Route path="/league/:leagueSlug" element={<LeaguePage />} />
        
        {/* Sports routes - PUBLIC for SEO */}
        <Route path="/sports" element={<OptimizedSports />} />
        
        {/* Match routes - PUBLIC for SEO */}
        <Route path="/match/:sport/:league/:slug/:matchId" element={<MatchPage />} />
        <Route path="/match-details/:matchId" element={<MatchPage />} />
        
        {/* Team routes - SEO friendly format (PUBLIC) */}
        <Route path="/team/:sport/:slug/:teamId" element={<TeamPage />} />
        <Route path="/team/:teamSlug" element={<TeamPage />} />
        <Route path="/team/:sport/:slug/:teamId/staff" element={<TeamStaffPage />} />
        <Route path="/team/:teamSlug/staff" element={<TeamStaffPage />} />
        
        {/* Player routes */}
        <Route path="/player/:playerId" element={<PlayerPage />} />
        
        {/* Polymarket routes - PUBLIC for SEO */}
        <Route path="/polymarket" element={<Polymarket />} />
        <Route path="/polymarket/event/:slug/:eventId" element={<PolymarketEventDetail />} />
        
        {/* Polymarket prediction creation */}
        <Route path="/create-polymarket-prediction" element={
          <ProtectedRoute>
            <CreatePolymarketPrediction />
          </ProtectedRoute>
        } />
        
        {/* Dashboard route */}
        <Route path="/dashboard/:streamId" element={<StreamerDashboard />} />
        <Route path="/stream/:callId/host" element={<StreamHostPage />} />
        <Route path="/stream/:callId/view" element={<StreamViewerPage />} />
        <Route path="/stream/:callId" element={<StreamViewerPage />} />
        
        {/* Protected dashboard route */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Protected routes */}
        {protectedRoutes.map((route) => {
          const Component = route.component;
          return (
            <Route 
              key={route.path}
              path={route.path} 
              element={
                <ProtectedRoute>
                  <Component />
                </ProtectedRoute>
              } 
            />
          );
        })}
        
          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
}
