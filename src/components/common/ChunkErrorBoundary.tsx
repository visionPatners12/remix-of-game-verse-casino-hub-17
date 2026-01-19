import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';
import { NetworkErrorPage } from './NetworkErrorPage';

interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ChunkErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  isChunkError: boolean;
}

/**
 * Error boundary that specifically handles chunk loading failures.
 * Provides a user-friendly UI with a reload button when chunks fail to load.
 */
export class ChunkErrorBoundary extends Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  constructor(props: ChunkErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      isChunkError: false 
    };
  }

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    const isChunkError = 
      error.message.includes('dynamically imported module') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError');

    return { 
      hasError: true, 
      error,
      isChunkError 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[ChunkErrorBoundary] Error caught:', error, errorInfo);
  }

  handleReload = () => {
    sessionStorage.removeItem('chunk_reload_attempted');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <NetworkErrorPage
          onRetry={this.handleReload}
          title={this.state.isChunkError ? "Loading error" : "Network error"}
          message="An error occurred while loading. Check your connection and try again."
        />
      );
    }

    return this.props.children;
  }
}
