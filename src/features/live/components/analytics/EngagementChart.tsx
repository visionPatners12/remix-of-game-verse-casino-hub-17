import React, { useMemo } from 'react';
import { Card } from '@/ui';
import { EngagementMetric } from '@/services/analytics/analyticsService';
import { Heart, MessageSquare } from 'lucide-react';

interface EngagementChartProps {
  engagementHistory: EngagementMetric[];
  isLoading?: boolean;
  className?: string;
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ 
  engagementHistory, 
  isLoading = false,
  className = '' 
}) => {
  const chartData = useMemo(() => {
    if (!engagementHistory.length) return { likes: [], messages: [] };
    
    const maxLikes = Math.max(...engagementHistory.map(e => e.likes), 1);
    const maxMessages = Math.max(...engagementHistory.map(e => e.messages), 1);
    
    const likes = engagementHistory.map((metric, index) => ({
      x: (index / (engagementHistory.length - 1)) * 100,
      y: 100 - (metric.likes / maxLikes) * 80, // 80% max height for padding
      value: metric.likes,
      timestamp: metric.created_at
    }));

    const messages = engagementHistory.map((metric, index) => ({
      x: (index / (engagementHistory.length - 1)) * 100,
      y: 100 - (metric.messages / maxMessages) * 80,
      value: metric.messages,
      timestamp: metric.created_at
    }));

    return { likes, messages };
  }, [engagementHistory]);

  const likesPath = useMemo(() => {
    if (!chartData.likes.length) return '';
    const points = chartData.likes.map(point => `${point.x},${point.y}`);
    return `M ${points.join(' L ')}`;
  }, [chartData.likes]);

  const messagesPath = useMemo(() => {
    if (!chartData.messages.length) return '';
    const points = chartData.messages.map(point => `${point.x},${point.y}`);
    return `M ${points.join(' L ')}`;
  }, [chartData.messages]);

  const currentLikes = engagementHistory[engagementHistory.length - 1]?.likes ?? 0;
  const currentMessages = engagementHistory[engagementHistory.length - 1]?.messages ?? 0;
  const totalLikes = engagementHistory.reduce((sum, e) => sum + e.likes, 0);
  const totalMessages = engagementHistory.reduce((sum, e) => sum + e.messages, 0);

  if (isLoading) {
    return (
      <Card className={`p-6 bg-card/50 backdrop-blur-sm border border-border/50 ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Engagement</h3>
            <div className="animate-pulse bg-muted h-4 w-24 rounded"></div>
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
          <h3 className="text-lg font-semibold text-foreground">Engagement</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-500" />
              <span className="text-red-500 font-semibold">{currentLikes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-blue-500" />
              <span className="text-blue-500 font-semibold">{currentMessages}</span>
            </div>
          </div>
        </div>
        
        {/* Stats totales */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <div>
              <span className="text-muted-foreground">Total likes: </span>
              <span className="font-semibold text-red-500">{totalLikes}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <div>
              <span className="text-muted-foreground">Total messages: </span>
              <span className="font-semibold text-blue-500">{totalMessages}</span>
            </div>
          </div>
        </div>

        {/* Graphique double */}
        <div className="relative h-48 bg-muted/5 rounded-lg overflow-hidden">
          {chartData.likes.length > 0 || chartData.messages.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="likesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(239 68 68)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(239 68 68)" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="messagesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Grille de fond */}
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
              
              {/* Zone sous la courbe des likes */}
              {likesPath && (
                <path
                  d={`${likesPath} L 100,100 L 0,100 Z`}
                  fill="url(#likesGradient)"
                />
              )}
              
              {/* Zone sous la courbe des messages */}
              {messagesPath && (
                <path
                  d={`${messagesPath} L 100,100 L 0,100 Z`}
                  fill="url(#messagesGradient)"
                />
              )}
              
              {/* Ligne des likes */}
              {likesPath && (
                <path
                  d={likesPath}
                  fill="none"
                  stroke="rgb(239 68 68)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              
              {/* Ligne des messages */}
              {messagesPath && (
                <path
                  d={messagesPath}
                  fill="none"
                  stroke="rgb(59 130 246)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              
              {/* Points des likes */}
              {chartData.likes.map((point, index) => (
                <circle
                  key={`like-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="1.5"
                  fill="rgb(239 68 68)"
                  className="hover:r-3 transition-all cursor-pointer"
                >
                  <title>{point.value} likes</title>
                </circle>
              ))}
              
              {/* Points des messages */}
              {chartData.messages.map((point, index) => (
                <circle
                  key={`message-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="1.5"
                  fill="rgb(59 130 246)"
                  className="hover:r-3 transition-all cursor-pointer"
                >
                  <title>{point.value} messages</title>
                </circle>
              ))}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p>Aucune donnée d'engagement</p>
                <p className="text-xs mt-1">Les interactions apparaîtront ici</p>
              </div>
            </div>
          )}
        </div>

        {/* Légende */}
        <div className="flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500 rounded"></div>
            <span className="text-muted-foreground">Likes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500 rounded"></div>
            <span className="text-muted-foreground">Messages</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>-1h</span>
          <span>-30m</span>
          <span>maintenant</span>
        </div>
      </div>
    </Card>
  );
};
