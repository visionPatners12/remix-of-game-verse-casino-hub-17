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

// Loading fallback with branded loader
import { FullPageLoader } from '@/components/ui/full-page-loader';

const PageLoader = () => <FullPageLoader text="Loading..." />;

// Lazy loaded pages with retry
const Games = lazyWithRetry(() => import('@/pages/Games'));
const PublicHome = lazyWithRetry(() => import('@/pages/PublicHome'));
const TokenConfirmation = lazyWithRetry(() => import('@/pages/TokenConfirmation'));
const Legal = lazyWithRetry(() => import('@/pages/Legal'));
const FAQ = lazyWithRetry(() => import('@/pages/FAQ'));
const Support = lazyWithRetry(() => import('@/pages/Support'));
const Terms = lazyWithRetry(() => import('@/pages/Terms'));
const Privacy = lazyWithRetry(() => import('@/pages/Privacy'));
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
          
          {/* Public routes */}
          <Route path="/home" element={<PublicHome />} />
          <Route path="/token-confirmation" element={<TokenConfirmation />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
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
