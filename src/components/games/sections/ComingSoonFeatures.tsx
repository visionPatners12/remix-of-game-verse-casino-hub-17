import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Swords, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Globe, 
  Zap,
  Users,
  Target,
  Gamepad2
} from 'lucide-react';
import { UpcomingFeatureCard } from '../UpcomingFeatureCard';
import { useTranslation } from 'react-i18next';

export const ComingSoonFeatures = () => {
  const { t } = useTranslation('games');

  const tournaments = {
    icon: Trophy,
    title: t('upcoming.tournaments.title', 'Tournaments'),
    description: t('upcoming.tournaments.description', 'Compete against players worldwide for real crypto prizes'),
    chips: [
      { icon: Calendar, label: t('upcoming.tournaments.chip1', 'Weekly Events') },
      { icon: DollarSign, label: t('upcoming.tournaments.chip2', 'USDT Prizes') },
      { icon: Globe, label: t('upcoming.tournaments.chip3', 'Global Ranking') },
      { icon: Zap, label: t('upcoming.tournaments.chip4', 'Brackets') },
    ],
    accentColor: 'amber' as const,
  };

  const playOnline = {
    icon: Swords,
    title: t('upcoming.playOnline.title', 'Play Online'),
    description: t('upcoming.playOnline.description', 'Find opponents instantly and compete in ranked matches'),
    chips: [
      { icon: Zap, label: t('upcoming.playOnline.chip1', 'Instant Match') },
      { icon: Target, label: t('upcoming.playOnline.chip2', 'Ranked') },
      { icon: Users, label: t('upcoming.playOnline.chip3', 'With Friends') },
      { icon: Gamepad2, label: t('upcoming.playOnline.chip4', 'Stake & Play') },
    ],
    accentColor: 'violet' as const,
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-primary" />
          <div className="absolute inset-0 blur-md bg-primary/50" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          {t('upcoming.title', 'Coming Soon')}
        </h2>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UpcomingFeatureCard {...tournaments} />
        <UpcomingFeatureCard {...playOnline} />
      </div>
    </section>
  );
};
