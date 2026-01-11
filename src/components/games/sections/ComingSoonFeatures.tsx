import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords, Sparkles } from 'lucide-react';
import { UpcomingFeatureCard } from '../UpcomingFeatureCard';
import { useTranslation } from 'react-i18next';

export const ComingSoonFeatures = () => {
  const { t } = useTranslation('games');

  const tournaments = {
    icon: Trophy,
    title: t('upcoming.tournaments.title', 'Tournaments'),
    description: t('upcoming.tournaments.description', 'Compete against players worldwide for real crypto prizes'),
    features: [
      t('upcoming.tournaments.feature1', 'Weekly & daily events'),
      t('upcoming.tournaments.feature2', 'USDT prize pools'),
      t('upcoming.tournaments.feature3', 'Global leaderboards'),
      t('upcoming.tournaments.feature4', 'Bracket elimination'),
    ],
    gradient: 'from-amber-500/20 to-orange-500/10',
    iconGradient: 'from-amber-500 to-orange-600',
  };

  const playOnline = {
    icon: Swords,
    title: t('upcoming.playOnline.title', 'Play Online'),
    description: t('upcoming.playOnline.description', 'Find opponents instantly and compete in ranked matches'),
    features: [
      t('upcoming.playOnline.feature1', 'Instant matchmaking'),
      t('upcoming.playOnline.feature2', 'Skill-based ranking'),
      t('upcoming.playOnline.feature3', 'Play with friends'),
      t('upcoming.playOnline.feature4', 'Stake & compete'),
    ],
    gradient: 'from-violet-500/20 to-purple-500/10',
    iconGradient: 'from-violet-500 to-purple-600',
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5 text-primary" />
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
