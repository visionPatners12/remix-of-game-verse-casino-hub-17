
// Load polyfills first
import './polyfills';

// Initialize i18n
import './config/i18n';

// Define global process for browser compatibility
if (typeof globalThis.process === 'undefined') {
  (globalThis as any).process = {
    env: {},
    platform: 'browser',
    version: 'v18.0.0'
  };
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './app/App.tsx'
import './index.css'
import { logger } from './utils/logger'

logger.info('Application starting');

logger.info('React version:', (React as any).version, 'has use:', typeof (React as any).use);

// Global error handler for dynamic import failures
window.addEventListener('error', (event) => {
  const isChunkError = 
    event.message?.includes('dynamically imported module') ||
    event.message?.includes('Failed to fetch') ||
    event.message?.includes('Loading chunk');
  
  if (isChunkError) {
    const hasAttemptedReload = sessionStorage.getItem('chunk_error_reload') === 'true';
    
    if (!hasAttemptedReload) {
      logger.warn('[ChunkError] Dynamic import failed, reloading page...');
      sessionStorage.setItem('chunk_error_reload', 'true');
      window.location.reload();
    }
  }
});

// Clear the reload flag on successful load
window.addEventListener('load', () => {
  sessionStorage.removeItem('chunk_error_reload');
  sessionStorage.removeItem('chunk_reload_attempted');
});

// Force dark theme
document.documentElement.classList.add('dark');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  logger.info('Creating React root');
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
      <SpeedInsights />
    </React.StrictMode>
  );
  
  logger.info('React app rendered successfully');
} catch (error) {
  logger.error('Failed to render app:', error);
  
  // Fallback for critical error
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a1a1a; color: white; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Network error</h1>
        <p style="margin-bottom: 1rem;">Please check your connection and try again.</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
          Refresh
        </button>
      </div>
    </div>
  `;
}
