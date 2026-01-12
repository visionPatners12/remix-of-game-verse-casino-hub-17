import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface FeatureChip {
  icon: LucideIcon;
  label: string;
}

interface UpcomingFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  chips: FeatureChip[];
  accentColor: 'amber' | 'violet';
  onNotifyMe?: () => void;
  showNotify?: boolean;
}

export const UpcomingFeatureCard = ({
  icon: Icon,
  title,
  description,
  chips,
  accentColor = 'amber',
  showNotify = true,
}: UpcomingFeatureCardProps) => {
  const { t } = useTranslation('games');

  const handleNotifyMe = () => {
    toast.success(t('notifySuccess', "You'll be notified when available!"), {
      description: title,
    });
  };

  const isAmber = accentColor === 'amber';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-card/50 backdrop-blur-xl',
        'border border-border/30',
        'transition-shadow duration-500',
        isAmber 
          ? 'hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)]' 
          : 'hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.3)]'
      )}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          'absolute inset-0 opacity-60',
          isAmber
            ? 'bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent'
            : 'bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent'
        )}
      />

      {/* Shine Sweep Animation */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -skew-x-12 pointer-events-none"
      />

      {/* Glow Orbs */}
      <div
        className={cn(
          'absolute -top-12 -right-12 w-28 h-28 rounded-full blur-3xl pointer-events-none',
          isAmber ? 'bg-amber-500/25' : 'bg-violet-500/25'
        )}
      />
      <div
        className={cn(
          'absolute -bottom-10 -left-10 w-24 h-24 rounded-full blur-2xl pointer-events-none animate-pulse',
          isAmber ? 'bg-orange-500/20' : 'bg-purple-500/20'
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header: Icon + Badge */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon with Glow */}
          <motion.div
            whileHover={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div
              className={cn(
                'absolute inset-0 blur-xl opacity-60',
                isAmber ? 'bg-amber-500' : 'bg-violet-500'
              )}
            />
            <div
              className={cn(
                'relative w-14 h-14 rounded-xl flex items-center justify-center',
                'bg-gradient-to-br shadow-xl',
                isAmber
                  ? 'from-amber-400 to-orange-600 shadow-amber-500/30'
                  : 'from-violet-400 to-purple-600 shadow-violet-500/30'
              )}
            >
              <Icon className="w-7 h-7 text-white drop-shadow-md" />
            </div>
          </motion.div>

          {/* Premium Badge */}
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 10px rgba(139,92,246,0.3)',
                '0 0 20px rgba(245,158,11,0.4)',
                '0 0 10px rgba(139,92,246,0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
              'bg-gradient-to-r from-violet-500 via-primary to-amber-500 bg-[length:200%_100%]',
              'text-white border border-border/30',
              'animate-[gradient-x_3s_ease_infinite]'
            )}
          >
            {t('soon', 'Coming Soon')}
          </motion.div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

        {/* Feature Chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {chips.map((chip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.08 }}
              className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
              'bg-muted/30 border border-border/30',
              'text-xs text-foreground/80'
              )}
            >
              <chip.icon className={cn(
                'w-3 h-3',
                isAmber ? 'text-amber-400' : 'text-violet-400'
              )} />
              <span>{chip.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Notify Button */}
        {showNotify && (
          <motion.button
            onClick={handleNotifyMe}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl',
              'bg-muted/30 border border-border/30',
              'text-sm font-medium text-foreground',
              'transition-all duration-300',
              'hover:bg-muted/50 hover:border-border/50',
              isAmber
                ? 'hover:shadow-lg hover:shadow-amber-500/15'
                : 'hover:shadow-lg hover:shadow-violet-500/15'
            )}
          >
            <Bell className="w-4 h-4" />
            {t('notifyMe', 'Get Notified')}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
