import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/ui';
import { Flame, TrendingUp, Hash, Loader2 } from 'lucide-react';
import { SoonOverlay } from '@/components/ui/SoonOverlay';
import { useTrendingHashtags } from '../../../hooks/useTrendingHashtags';

interface TrendingTopic {
  id: string;
  hashtag: string;
  posts: number;
  growth: string;
  category: 'match' | 'team' | 'player' | 'league';
}

export function TrendingView() {
  const { t } = useTranslation('feed');
  const { hashtags: trendingTopics, isLoading } = useTrendingHashtags(10);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'match': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'team': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'player': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'league': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <SoonOverlay>
      <div className="max-w-4xl mx-auto space-y-4 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold">{t('trending.title')}</h1>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
            {t('navigation.hot')}
          </Badge>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hash className="h-4 w-4 text-primary" />
              {t('trending.hashtags')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                {t('loading.trendingTopics')}
              </div>
            ) : trendingTopics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('empty.noTrending')}
              </div>
            ) : (
              <div className="grid gap-1">
                {trendingTopics.map((topic, index) => (
                  <div key={topic.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{topic.hashtag}</h3>
                        <Badge className={getCategoryColor(topic.category)} variant="outline">
                          {topic.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-xs font-medium text-green-500">{topic.growth}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatNumber(topic.posts)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">— {t('trending.popularPosts')}</h2>
          <div className="space-y-0">
            <p className="text-sm text-muted-foreground p-4">{t('trending.disabledMessage')}</p>
          </div>
        </div>
      </div>
    </SoonOverlay>
  );
}
