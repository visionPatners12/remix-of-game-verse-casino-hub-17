import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/ui';

interface NetworkErrorFallbackProps {
  onRefresh?: () => void;
  variant?: 'full' | 'compact';
  title?: string;
  description?: string;
}

export function NetworkErrorFallback({ 
  onRefresh, 
  variant = 'full',
  title = 'Network error',
  description = 'Please check your connection and try again.'
}: NetworkErrorFallbackProps) {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <WifiOff className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground flex-1">{title}</span>
        <Button size="sm" variant="ghost" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Button onClick={handleRefresh} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
}
