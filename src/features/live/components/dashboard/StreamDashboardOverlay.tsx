import React, { useEffect, useState } from 'react';
import { Button, Card } from '@/ui';
import { 
  X, 
  Play, 
  Square, 
  Settings, 
  Share, 
  BarChart3,
  Minimize2 
} from 'lucide-react';
import { analyticsService, StreamMetrics, ViewerMetric, EngagementMetric } from '@/services/analytics/analyticsService';
import { StreamMetricsCards, RealtimeViewersChart, EngagementChart } from '@/features/live/components/analytics';
import { useResponsive } from '@/hooks/useResponsive';
import { logger } from '@/utils/logger';

interface StreamDashboardOverlayProps {
  streamId: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onGoToStream?: () => void;
  className?: string;
}

export const StreamDashboardOverlay: React.FC<StreamDashboardOverlayProps> = ({
  streamId,
  isOpen,
  onToggle,
  onGoToStream,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  
  const [metrics, setMetrics] = useState<StreamMetrics | null>(null);
  const [viewerHistory, setViewerHistory] = useState<ViewerMetric[]>([]);
  const [engagementHistory, setEngagementHistory] = useState<EngagementMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!streamId || !isOpen) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [metricsData, viewerData, engagementData] = await Promise.all([
          analyticsService.getStreamMetrics(streamId),
          analyticsService.getViewerHistory(streamId),
          analyticsService.getEngagementHistory(streamId)
        ]);

        setMetrics(metricsData);
        setViewerHistory(viewerData);
        setEngagementHistory(engagementData);
      } catch (error) {
        logger.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [streamId, isOpen]);

  // Real-time refresh every 5 seconds if stream is live
  useEffect(() => {
    if (!streamId || !metrics?.isLive || !isOpen) return;

    const interval = setInterval(async () => {
      setIsRefreshing(true);
      try {
        const [metricsData, viewerData, engagementData] = await Promise.all([
          analyticsService.getStreamMetrics(streamId),
          analyticsService.getViewerHistory(streamId, 1), // Last hour
          analyticsService.getEngagementHistory(streamId, 1)
        ]);

        setMetrics(metricsData);
        setViewerHistory(viewerData);
        setEngagementHistory(engagementData);
      } catch (error) {
        logger.error('Error refreshing data:', error);
      } finally {
        setIsRefreshing(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [streamId, metrics?.isLive, isOpen]);

  const handleGoToStream = () => {
    onGoToStream?.();
    onToggle(false);
  };

  if (!isOpen) return null;

  // Mobile: Full screen modal
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-overlay-backdrop overlay-backdrop animate-fade-in"
          onClick={() => onToggle(false)}
        />
        
        {/* Modal */}
        <div className={`
          fixed inset-0 z-overlay-modal overlay-glass animate-fade-in
          flex flex-col safe-top safe-bottom
          ${className}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
              </div>
              {metrics?.isLive && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                  <span className="text-xs text-destructive font-medium">LIVE</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isRefreshing && (
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-auto p-4 space-y-6">
              {/* Stream status */}
              <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {metrics?.isLive ? 'Live Stream' : 'Stream Offline'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {metrics?.isLive 
                      ? `Active for ${Math.floor((metrics.duration || 0) / 60)} minutes`
                      : 'Ready to start your next live'
                    }
                  </p>
                </div>
                {metrics?.isLive && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {metrics.currentViewers}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      viewers online
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Metrics */}
            <div>
              <h3 className="text-base font-medium text-foreground mb-4">Real-time Metrics</h3>
                <StreamMetricsCards metrics={metrics} isLoading={isLoading} />
              </div>

              {/* Charts */}
              <div className="space-y-6">
                <RealtimeViewersChart 
                  viewerHistory={viewerHistory} 
                  isLoading={isLoading}
                />
                <EngagementChart 
                  engagementHistory={engagementHistory} 
                  isLoading={isLoading}
                />
              </div>

              {/* Quick actions */}
              <div>
                <h3 className="text-base font-medium text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleGoToStream}
                    className="p-4 h-auto flex-col gap-2"
                  >
                    {metrics?.isLive ? (
                      <>
                        <Square className="w-6 h-6" />
                        <span>Manage Stream</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6" />
                        <span>Start Stream</span>
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="p-4 h-auto flex-col gap-2"
                    disabled
                  >
                    <Settings className="w-6 h-6" />
                    <span>Settings</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Desktop: Right sidebar modal
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-overlay-backdrop overlay-backdrop animate-fade-in"
        onClick={() => onToggle(false)}
      />
      
      {/* Sidebar modal */}
      <div className={`
        fixed top-0 right-0 h-full w-96 z-overlay-modal 
        overlay-glass animate-slide-in-right
        flex flex-col border-l border-border
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            </div>
            {metrics?.isLive && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <span className="text-xs text-destructive font-medium">LIVE</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isRefreshing && (
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-auto p-4 space-y-6">
            {/* Stream status */}
            <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
              <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {metrics?.isLive ? 'Live' : 'Offline'}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics?.isLive 
                    ? `${Math.floor((metrics.duration || 0) / 60)}min`
                    : 'Ready to stream'
                  }
                </p>
              </div>
              {metrics?.isLive && (
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    {metrics.currentViewers}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    viewers
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Compact metrics */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Metrics</h3>
              <StreamMetricsCards metrics={metrics} isLoading={isLoading} />
            </div>

            {/* Charts */}
            <div className="space-y-4">
              <RealtimeViewersChart 
                viewerHistory={viewerHistory} 
                isLoading={isLoading}
              />
              <EngagementChart 
                engagementHistory={engagementHistory} 
                isLoading={isLoading}
              />
            </div>

          {/* Quick actions */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={handleGoToStream}
                className="w-full justify-start gap-2"
                size="sm"
              >
                {metrics?.isLive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {metrics?.isLive ? 'Manage' : 'Start'}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-start gap-2"
                size="sm"
                disabled
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
          </div>
        )}
      </div>
    </>
  );
};