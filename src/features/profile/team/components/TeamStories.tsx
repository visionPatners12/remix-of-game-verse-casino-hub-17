import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Calendar, Trophy } from 'lucide-react';
import type { FootballApiPlayerData, FootballApiFixtureData } from '@/types/footballApi';

interface TeamStoriesProps {
  highlights?: any[];
  squad?: FootballApiPlayerData[];
  nextMatch?: FootballApiFixtureData;
  trophies?: any[];
  onStoryClick: (type: 'highlights' | 'squad' | 'next-match' | 'trophies') => void;
}

interface StoryItemProps {
  type: 'highlights' | 'squad' | 'next-match' | 'trophies';
  title: string;
  icon: React.ReactNode;
  badge?: string;
  gradient: string;
  onClick: () => void;
  data?: any;
}

function StoryItem({ type, title, icon, badge, gradient, onClick, data }: StoryItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-0" onClick={onClick}>
      <div className={`relative w-16 h-16 rounded-full p-0.5 ${gradient} cursor-pointer`}>
        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        </div>
        {badge && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 px-1.5 text-xs font-bold"
          >
            {badge}
          </Badge>
        )}
      </div>
      <span className="text-xs text-foreground font-medium truncate w-16 text-center">
        {title}
      </span>
    </div>
  );
}

export function TeamStories({ highlights, squad, nextMatch, trophies, onStoryClick }: TeamStoriesProps) {
  const { t } = useTranslation('pages');
  
  const stories = [
    {
      type: 'highlights' as const,
      title: t('team.stories.highlights'),
      icon: <Play className="w-5 h-5" />,
      badge: highlights?.length ? highlights.length.toString() : undefined,
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
      data: highlights
    },
    {
      type: 'squad' as const,
      title: t('team.stories.squad'),
      icon: <Users className="w-5 h-5" />,
      badge: squad?.length ? squad.length.toString() : undefined,
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      data: squad
    },
    {
      type: 'next-match' as const,
      title: t('team.stories.nextMatch'),
      icon: <Calendar className="w-5 h-5" />,
      badge: nextMatch ? '1' : undefined,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
      data: nextMatch
    },
    {
      type: 'trophies' as const,
      title: t('team.stories.trophies'),
      icon: <Trophy className="w-5 h-5" />,
      badge: trophies?.length ? trophies.length.toString() : undefined,
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      data: trophies
    }
  ];

  return (
    <div className="bg-background border-b px-4 py-3">
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {stories.map((story) => (
          <StoryItem
            key={story.type}
            type={story.type}
            title={story.title}
            icon={story.icon}
            badge={story.badge}
            gradient={story.gradient}
            onClick={() => onStoryClick(story.type)}
            data={story.data}
          />
        ))}
      </div>
    </div>
  );
}