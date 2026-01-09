import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '@/ui';
import { ArrowLeft, Play, Square, Settings, Share, BarChart3 } from 'lucide-react';
import { analyticsService, StreamMetrics, ViewerMetric, EngagementMetric } from '@/services/analytics/analyticsService';
import { StreamMetricsCards, RealtimeViewersChart, EngagementChart } from '@/features/live/components/analytics';
import { logger } from '@/utils/logger';

export default function StreamerDashboard() {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState<StreamMetrics | null>(null);
  const [viewerHistory, setViewerHistory] = useState<ViewerMetric[]>([]);
  const [engagementHistory, setEngagementHistory] = useState<EngagementMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    if (!streamId) return;

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
        logger.error('Erreur lors du chargement des données dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [streamId]);

  // Actualisation en temps réel toutes les 5 secondes si le stream est live
  useEffect(() => {
    if (!streamId || !metrics?.isLive) return;

    const interval = setInterval(async () => {
      setIsRefreshing(true);
      try {
        const [metricsData, viewerData, engagementData] = await Promise.all([
          analyticsService.getStreamMetrics(streamId),
          analyticsService.getViewerHistory(streamId, 1), // Dernière heure
          analyticsService.getEngagementHistory(streamId, 1)
        ]);

        setMetrics(metricsData);
        setViewerHistory(viewerData);
        setEngagementHistory(engagementData);
      } catch (error) {
        logger.error('Erreur lors de l\'actualisation:', error);
      } finally {
        setIsRefreshing(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [streamId, metrics?.isLive]);

  const handleGoToStream = () => {
    if (streamId) {
      navigate(`/stream/${streamId}/host`);
    }
  };

  const handleBack = () => {
    navigate('/live/create');
  };

  if (!streamId) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Stream ID manquant</p>
          <Button onClick={handleBack} className="mt-4">
            Retour
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div 
        className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50"
        style={{ paddingTop: 'var(--safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Dashboard Streamer
              </h1>
              {metrics?.isLive && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-500 font-medium">EN DIRECT</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isRefreshing && (
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToStream}
              className="flex items-center gap-2"
            >
              {metrics?.isLive ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {metrics?.isLive ? 'Arrêter' : 'Démarrer'}
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="p-4 space-y-6">
        {/* Statut du stream */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {metrics?.isLive ? 'Stream en direct' : 'Stream hors ligne'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {metrics?.isLive 
                  ? `Actif depuis ${Math.floor((metrics.duration || 0) / 60)} minutes`
                  : 'Prêt à démarrer votre prochain live'
                }
              </p>
            </div>
            {metrics?.isLive && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {metrics.currentViewers}
                </div>
                <div className="text-xs text-muted-foreground">
                  viewers connectés
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Métriques principales */}
        <div>
          <h3 className="text-base font-medium text-foreground mb-4">Métriques en temps réel</h3>
          <StreamMetricsCards metrics={metrics} isLoading={isLoading} />
        </div>

        {/* Graphiques */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RealtimeViewersChart 
            viewerHistory={viewerHistory} 
            isLoading={isLoading}
          />
          <EngagementChart 
            engagementHistory={engagementHistory} 
            isLoading={isLoading}
          />
        </div>

        {/* Actions rapides */}
        <div>
          <h3 className="text-base font-medium text-foreground mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={handleGoToStream}
              className="p-4 h-auto flex-col gap-2"
            >
              {metrics?.isLive ? (
                <>
                  <Square className="w-6 h-6" />
                  <span>Gérer le stream</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  <span>Démarrer le stream</span>
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              className="p-4 h-auto flex-col gap-2"
              disabled
            >
              <Settings className="w-6 h-6" />
              <span>Paramètres</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}