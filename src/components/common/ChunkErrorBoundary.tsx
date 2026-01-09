import React, { Component, ErrorInfo, ReactNode } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/ui';
import { logger } from '@/utils/logger';

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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
          <WifiOff className="h-16 w-16 text-muted-foreground mb-6" />
          
          <h3 className="text-xl font-semibold mb-3">
            {this.state.isChunkError ? 'Loading error' : 'Network error'}
          </h3>
          
          <p className="text-muted-foreground mb-8 max-w-md">
            Please check your connection and try again.
          </p>
          
          <Button
            onClick={this.handleReload}
            variant="default"
            size="lg"
            className="gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Refresh
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
