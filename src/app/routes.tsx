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

// Loading fallback
const PageLoader = () => (
  <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lazy loaded pages with retry
const Games = lazyWithRetry(() => import('@/pages/Games'));
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

// Ludo game pages - Import directly to avoid loading entire barrel
const LudoKonva = lazyWithRetry(() => import('@/features/ludo/ui/LudoKonva'));
const LudoCreateGamePage = lazyWithRetry(() => import('@/features/ludo/ui/LudoCreateGamePage'));
const ActiveGameGuard = lazyWithRetry(() => import('@/features/ludo/components/ActiveGameGuard').then(m => ({ default: m.ActiveGameGuard })));
const LudoKonvaWithGuard = lazyWithRetry(() => import('@/features/ludo/components/ActiveGameGuard').then(m => ({ default: m.LudoKonvaWithGuard })));

// Other features
const OnboardingRouter = lazyWithRetry(() => import('@/features/onboarding').then(m => ({ default: m.OnboardingRouter })));
const NFTDetailPage = lazyWithRetry(() => import('@/features/nft').then(m => ({ default: m.NFTDetailPage })));
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
          {/* Landing route */}
          <Route path="/" element={
            <PublicRoute>
              <LandingHome />
            </PublicRoute>
          } />
          
          {/* Dashboard redirects to games */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Games />
            </ProtectedRoute>
          } />
          
          {/* Auth routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth2" element={<Auth2 />} />
          <Route path="/auth/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
          
          {/* Landing pages */}
          <Route path="/discover/feed" element={<DiscoverFeed />} />
          <Route path="/discover/forfan" element={<DiscoverForFan />} />
          <Route path="/discover/sports" element={<DiscoverSports />} />
          <Route path="/discover/web3" element={<DiscoverWeb3 />} />
          <Route path="/discover/gaming" element={<DiscoverGaming />} />
          <Route path="/discover/polymarket" element={<DiscoverPolymarket />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          
          {/* Public routes */}
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
          
          {/* Game routes - protected by ActiveGameGuard */}
          <Route path="/games/ludo/create" element={
            <ActiveGameGuard>
              <LudoCreateGamePage />
            </ActiveGameGuard>
          } />
          <Route path="/games/ludo/play/:gameId" element={
            <LudoKonvaWithGuard>
              <LudoKonva />
            </LudoKonvaWithGuard>
          } />
          
          {/* NFT Detail route */}
          <Route path="/nft-details" element={<NFTDetailPage />} />
          
          {/* Onboarding routes */}
          <Route path="/onboarding/*" element={
            <ProtectedRoute>
              <OnboardingRouter />
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
