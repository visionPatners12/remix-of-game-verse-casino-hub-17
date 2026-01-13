import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useIsInGameRoom } from '@/hooks/room/useIsInGameRoom';
import { useIsMobile } from '@/hooks/use-mobile';
import { QuickPostSheet } from '@/components/creation/QuickPostSheet';
import { CreationProvider } from '@/components/creation/CreationManager';
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar';
import { useFullscreen } from '@/contexts/FullscreenContext';
import { FloatingActionStack } from '@/components/shared/FloatingActionStack';
import { GlobalSEOSchema } from '@/components/seo/GlobalSEOSchema';
import { HreflangTags } from '@/components/seo/HreflangTags';
import { NavigationVisibilityProvider, useNavigationVisibility } from '@/contexts/NavigationVisibilityContext';
import { useStandaloneMode } from '@/hooks/useStandaloneMode';

interface AppShellProps {
  children: React.ReactNode;
}

// Routes statiques où on cache toujours la navigation (desktop + mobile)
const ALWAYS_HIDDEN_NAV_ROUTES = ['/auth', '/onboarding', '/stream/', '/discover', '/roadmap', '/games/ludo'];

// Routes où on cache la navigation UNIQUEMENT sur mobile/PWA (pages avec leur propre header)
const MOBILE_ONLY_HIDDEN_NAV_ROUTES = [
  '/search',
  '/messages',
  '/settings',
  '/notifications',
  '/wallet',
  '/deposit',
  '/mobile-deposit',
  '/withdrawal',
  '/my-bets',
  '/transactions',
  '/profile',
  '/user',
  '/swap',
  '/my-pryze',
  '/menu',
  '/mobile-menu',
  '/pryzen-card',
  '/ticket-slip',
  '/ticket',
  '/polymarket/event',
  '/match',
  '/team',
  '/league',
];

// Route exacte de la landing page
const isLandingPage = (pathname: string) => pathname === '/';

/**
 * Contenu interne de AppShell qui utilise le contexte de visibilité
 */
const AppShellContent = memo(({ children }: AppShellProps) => {
  const location = useLocation();
  const isInGameRoom = useIsInGameRoom();
  const isMobile = useIsMobile();
  const { isFullscreen } = useFullscreen();
  const { hideNavigation: contextHideNav } = useNavigationVisibility();
  const { isStandalone } = useStandaloneMode();

  // Cacher sur mobile OU en PWA standalone pour les routes avec leur propre header
  const shouldHideMobileOrPWANav = (isMobile || isStandalone) && 
    MOBILE_ONLY_HIDDEN_NAV_ROUTES.some(route => location.pathname.startsWith(route));

  // Combiner les routes statiques + contexte + fullscreen + landing page + mobile-only/PWA
  const shouldHideNav = isFullscreen || 
    contextHideNav ||
    isLandingPage(location.pathname) ||
    ALWAYS_HIDDEN_NAV_ROUTES.some(route => location.pathname.startsWith(route)) ||
    shouldHideMobileOrPWANav;

  // Déterminer si on désactive les interactions de navigation
  const disableNavigation = isInGameRoom;

  return (
    <CreationProvider>
      <GlobalSEOSchema />
      <HreflangTags />
      <div className="min-h-screen flex flex-col bg-background w-full overflow-x-hidden">
        {/* Navigation - TOUJOURS montée, juste cachée visuellement si nécessaire */}
        <div className={shouldHideNav ? 'hidden' : 'contents'}>
          <Navigation disableNavigation={disableNavigation} />
        </div>
        
        {/* Main content area */}
        <main 
          className={`flex-grow w-full overflow-x-hidden ${
            shouldHideNav
              ? "pt-0 px-0"
              : (isMobile 
                  ? "px-0" 
                  : "pt-14 px-2 sm:px-3 md:px-4 pb-16 md:pb-8")
          }`}
          style={
            shouldHideNav 
              ? { paddingBottom: 'env(safe-area-inset-bottom)' }
              : (isMobile 
                  ? { 
                      paddingTop: 'calc(3.5rem + env(safe-area-inset-top))', 
                      paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' 
                    } 
                  : undefined)
          }
        >
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation - hidden in fullscreen */}
        <div className={shouldHideNav ? 'hidden' : 'contents'}>
          <MobileBottomBar />
        </div>
        
        {/* Floating Action Stack - Ticket + Create Post */}
        {!isFullscreen && !isLandingPage(location.pathname) && <FloatingActionStack />}
        
        {/* Sheet for quick creation */}
        {isMobile && !isFullscreen && <QuickPostSheet />}
      </div>
    </CreationProvider>
  );
});

AppShellContent.displayName = 'AppShellContent';

/**
 * Shell persistant de l'application
 * La navigation reste TOUJOURS montée, seul le contenu change
 * Cela évite les flickerings et disparitions de navigation
 */
export const AppShell = memo(({ children }: AppShellProps) => {
  return (
    <NavigationVisibilityProvider>
      <AppShellContent>{children}</AppShellContent>
    </NavigationVisibilityProvider>
  );
});

AppShell.displayName = 'AppShell';
