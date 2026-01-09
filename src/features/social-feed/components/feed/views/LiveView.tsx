import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui';
import { Play, Clock, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useResponsive } from '@/hooks/useResponsive';

interface LiveStream {
  id: string;
  title: string;
  streamer: string;
  viewers: number;
  thumbnail: string;
  category: 'match' | 'analysis' | 'news';
  isLive: boolean;
  startTime?: string;
}

// Mock data for live and upcoming streams
const mockLiveStreams: LiveStream[] = [
  {
    id: '1',
    title: 'PSG vs Real Madrid - Live Match',
    streamer: 'SportLive24',
    viewers: 15420,
    thumbnail: '/placeholder-stream.jpg',
    category: 'match',
    isLive: true
  },
  {
    id: '2',
    title: 'Post-match Analysis Arsenal vs Chelsea',
    streamer: 'FootballExpert',
    viewers: 3245,
    thumbnail: '/placeholder-stream.jpg',
    category: 'analysis',
    isLive: true
  },
  {
    id: '3',
    title: 'Transfer News - Latest Rumors',
    streamer: 'TransferNews',
    viewers: 1890,
    thumbnail: '/placeholder-stream.jpg',
    category: 'news',
    isLive: true
  },
  {
    id: '4',
    title: 'Manchester United vs Liverpool',
    streamer: 'PremierLeagueLive',
    viewers: 0,
    thumbnail: '/placeholder-stream.jpg',
    category: 'match',
    isLive: false,
    startTime: '2024-01-20T15:00:00Z'
  }
];

export function LiveView() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isTablet } = useResponsive();
  const { t } = useTranslation('feed');
  
  const formatViewers = (viewers: number) => {
    if (viewers >= 1000) return `${(viewers / 1000).toFixed(1)}k`;
    return viewers.toString();
  };

  const formatStartTime = (startTime: string) => {
    const date = new Date(startTime);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const liveStreams = mockLiveStreams.filter(stream => stream.isLive);
  const upcomingStreams = mockLiveStreams.filter(stream => !stream.isLive);

  return (
    <div className="min-h-screen bg-background">
        {/* Clean header */}
        <div className="border-b">
          <div className={`mx-auto ${isMobile ? 'px-4 py-4' : 'max-w-6xl px-6 py-6'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold`}>
                  {t('live.title')}
                </h1>
                <span className="text-sm text-muted-foreground">
                  {t('live.liveCount', { count: liveStreams.length })}
                </span>
              </div>
              <Button
                onClick={() => navigate('/live/create')}
                size={isMobile ? 'sm' : 'default'}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {!isMobile && t('live.createLive')}
              </Button>
            </div>
          </div>
        </div>

        <div className={`mx-auto ${isMobile ? 'px-4 py-6' : 'max-w-6xl px-6 py-8'}`}>
          {/* Live streams */}
          {liveStreams.length > 0 && (
            <div className="space-y-4">
              <div className={`grid gap-4 ${
                isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {liveStreams.map((stream) => (
                  <div 
                    key={stream.id} 
                    className="group cursor-pointer select-none active:scale-[0.98] transition-transform duration-150 ease-out"
                    style={{ minHeight: '44px' }}
                  >
                    {/* Minimalist thumbnail */}
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4 group-active:bg-muted/80 transition-colors"
                         style={{ touchAction: 'manipulation' }}>
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Play className="h-12 w-12 text-primary/60" />
                      </div>
                      
                      {/* Clean LIVE badge */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          {t('navigation.liveBadge')}
                        </div>
                      </div>

                      {/* Clean viewers */}
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
                        {formatViewers(stream.viewers)}
                      </div>
                    </div>
                    
                     {/* Clean content */}
                    <div className="space-y-3" style={{ minHeight: '44px' }}>
                      <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary group-active:text-primary/80 transition-colors duration-150">
                        {stream.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{stream.streamer}</span>
                        <span className="capitalize px-2 py-1 bg-muted rounded-md">
                          {stream.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming streams */}
          {upcomingStreams.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>
                  {t('live.upcoming')}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {upcomingStreams.length}
                </span>
              </div>

              <div className={`grid gap-4 ${
                isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {upcomingStreams.map((stream) => (
                  <div 
                    key={stream.id} 
                    className="group cursor-pointer select-none opacity-70 hover:opacity-100 active:opacity-90 active:scale-[0.98] transition-all duration-150 ease-out"
                    style={{ minHeight: '44px', touchAction: 'manipulation' }}
                  >
                    {/* Thumbnail for upcoming streams */}
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4 group-active:bg-muted/80 transition-colors">
                      <div className="w-full h-full flex items-center justify-center">
                        <Clock className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                      
                      {/* Start time */}
                      <div className="absolute bottom-3 right-3 bg-background/90 text-foreground text-xs px-2 py-1 rounded-md">
                        {stream.startTime && formatStartTime(stream.startTime)}
                      </div>
                    </div>
                    
                    {/* Clean content */}
                    <div className="space-y-3" style={{ minHeight: '44px' }}>
                      <h3 className="font-medium text-sm leading-snug line-clamp-2">
                        {stream.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{stream.streamer}</span>
                        <span className="capitalize px-2 py-1 bg-muted rounded-md">
                          {stream.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
