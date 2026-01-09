import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/ui';
import { ViewerMetric } from '@/services/analytics/analyticsService';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface RealtimeViewersChartProps {
  viewerHistory: ViewerMetric[];
  isLoading?: boolean;
  className?: string;
}

export const RealtimeViewersChart: React.FC<RealtimeViewersChartProps> = ({ 
  viewerHistory, 
  isLoading = false,
  className = '' 
}) => {
  const { t, i18n } = useTranslation('streaming');
  const locale = i18n.language === 'fr' ? fr : enUS;
  const chartData = useMemo(() => {
    if (!viewerHistory.length) return [];
    
    const maxViewers = Math.max(...viewerHistory.map(v => v.viewer_count), 1);
    
    return viewerHistory.map((metric, index) => ({
      ...metric,
      percentage: (metric.viewer_count / maxViewers) * 100,
      x: (index / (viewerHistory.length - 1)) * 100,
    }));
  }, [viewerHistory]);

  const pathD = useMemo(() => {
    if (!chartData.length) return '';
    
    const points = chartData.map(point => `${point.x},${100 - point.percentage}`);
    return `M ${points.join(' L ')}`;
  }, [chartData]);

  const currentViewers = viewerHistory[viewerHistory.length - 1]?.viewer_count ?? 0;
  const maxViewers = Math.max(...viewerHistory.map(v => v.viewer_count), 0);
  const avgViewers = viewerHistory.length > 0 
    ? Math.round(viewerHistory.reduce((sum, v) => sum + v.viewer_count, 0) / viewerHistory.length)
    : 0;

  if (isLoading) {
    return (
      <Card className={`p-6 bg-card/50 backdrop-blur-sm border border-border/50 ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{t('analytics.realtimeViewers')}</h3>
            <div className="animate-pulse bg-muted h-4 w-16 rounded"></div>
          </div>
          <div className="h-48 bg-muted/20 rounded-lg animate-pulse"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{t('analytics.realtimeViewers')}</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">{t('analytics.live')}</span>
          </div>
        </div>
        
        {/* Stats rapides */}
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">{t('analytics.current')}: </span>
            <span className="font-semibold text-primary">{currentViewers}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('analytics.max')}: </span>
            <span className="font-semibold">{maxViewers}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('analytics.avg')}: </span>
            <span className="font-semibold">{avgViewers}</span>
          </div>
        </div>

        {/* Graphique */}
        <div className="relative h-48 bg-muted/5 rounded-lg overflow-hidden">
          {chartData.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grille de fond */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Lignes de grille horizontales */}
              {[20, 40, 60, 80].map(y => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                />
              ))}
              
              {/* Zone sous la courbe */}
              <path
                d={`${pathD} L 100,100 L 0,100 Z`}
                fill="url(#gradient)"
              />
              
              {/* Ligne principale */}
              <path
                d={pathD}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Points de données */}
              {chartData.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={100 - point.percentage}
                  r="1.5"
                  fill="hsl(var(--primary))"
                  className="hover:r-3 transition-all cursor-pointer"
                >
                  <title>
                    {point.viewer_count} viewers - {formatDistanceToNow(new Date(point.created_at), { locale, addSuffix: true })}
                  </title>
                </circle>
              ))}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p>{t('analytics.noData')}</p>
                <p className="text-xs mt-1">{t('analytics.dataAppears')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t('analytics.timeAgo1h')}</span>
          <span>{t('analytics.timeAgo30m')}</span>
          <span>{t('analytics.now')}</span>
        </div>
      </div>
    </Card>
  );
};
