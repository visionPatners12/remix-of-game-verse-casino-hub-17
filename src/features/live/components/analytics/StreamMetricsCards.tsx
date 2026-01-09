import React from 'react';
import { Card } from '@/ui';
import { Eye, Heart, MessageSquare, Clock, Users, TrendingUp } from 'lucide-react';
import { StreamMetrics } from '@/services/analytics/analyticsService';

interface StreamMetricsCardsProps {
  metrics: StreamMetrics | null;
  isLoading?: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  isLive = false,
  isLoading = false 
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  isLive?: boolean;
  isLoading?: boolean;
}) => (
  <Card className="p-4 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isLive ? 'bg-red-500/10' : 'bg-primary/10'}`}>
          <Icon className={`w-4 h-4 ${isLive ? 'text-red-500' : 'text-primary'}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-xl font-bold ${isLive ? 'text-red-500' : 'text-foreground'} ${isLoading ? 'animate-pulse' : ''}`}>
            {isLoading ? '---' : value}
          </p>
        </div>
      </div>
      {trend !== undefined && !isLoading && (
        <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  </Card>
);

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const formatWatchTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const StreamMetricsCards: React.FC<StreamMetricsCardsProps> = ({ 
  metrics, 
  isLoading = false 
}) => {
  const cards = [
    {
      title: 'Viewers actuels',
      value: metrics?.currentViewers ?? 0,
      icon: Eye,
      isLive: metrics?.isLive ?? false,
    },
    {
      title: 'Pic de viewers',
      value: metrics?.peakViewers ?? 0,
      icon: Users,
    },
    {
      title: 'Durée du stream',
      value: metrics ? formatDuration(metrics.duration) : '0s',
      icon: Clock,
      isLive: metrics?.isLive ?? false,
    },
    {
      title: 'Likes total',
      value: metrics?.likes ?? 0,
      icon: Heart,
    },
    {
      title: 'Temps moyen',
      value: metrics ? formatWatchTime(metrics.averageWatchTime) : '0m',
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <MetricCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          isLive={card.isLive}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
