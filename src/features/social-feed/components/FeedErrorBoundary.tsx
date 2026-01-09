import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';
import { Button } from '@/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props extends WithTranslation {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary specifically for the Feed component
 * Provides graceful fallback UI with retry functionality
 */
class FeedErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[FeedErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    const { t } = this.props;
    
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            {t('feed:error.unableToLoad')}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {t('feed:error.somethingWrong')}
          </p>
          <Button 
            onClick={this.handleRetry} 
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('feed:error.tryAgain')}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const FeedErrorBoundary = withTranslation()(FeedErrorBoundaryClass);
