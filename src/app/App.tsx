import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './providers/AppProvider';
import { AppRoutes } from './routes';
import { ScrollToTop } from '@/components/ScrollToTop';
import { AnimatedRoutes } from '@/components/AnimatedRoutes';
import { AppShell } from '@/components/AppShell';
import { UpdatePrompt, OfflineIndicator, PWAOptimizations, DeferredDeeplinkHandler } from '@/components/pwa';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';
import { OrientationWarning } from '@/components/OrientationWarning';
import { ChunkErrorBoundary } from '@/components/common/ChunkErrorBoundary';

function App() {
  // Lock screen to portrait mode on mobile (except for fullscreen videos)
  useScreenOrientation();

  return (
    <ChunkErrorBoundary>
      <div className="App">
        <OrientationWarning />
        <BrowserRouter>
          <ScrollToTop />
          <AppProvider>
            <OfflineIndicator />
            <UpdatePrompt />
            <PWAOptimizations />
            <DeferredDeeplinkHandler />
            {/* AppShell contient la navigation persistante */}
            <AppShell>
              <AnimatedRoutes>
                <AppRoutes />
              </AnimatedRoutes>
            </AppShell>
          </AppProvider>
        </BrowserRouter>
      </div>
    </ChunkErrorBoundary>
  );
}

export default App;