import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FeatureChip {
  icon: LucideIcon;
}

interface CompactUpcomingCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  chips: FeatureChip[];
  accentColor: 'amber' | 'violet';
  index?: number;
}

export const CompactUpcomingCard = ({
  icon: Icon,
  title,
  description,
  chips,
  accentColor = 'amber',
  index = 0,
}: CompactUpcomingCardProps) => {
  const isAmber = accentColor === 'amber';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 120, damping: 14 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'relative flex items-center gap-3 p-3 rounded-xl overflow-hidden',
        'bg-card/40 backdrop-blur-lg',
        'border border-border/30',
        'hover:border-border/50 hover:shadow-lg transition-all duration-300',
        isAmber ? 'hover:shadow-amber-500/10' : 'hover:shadow-violet-500/10'
      )}
    >
      {/* Background gradient */}
      <div
        className={cn(
          'absolute inset-0 opacity-30',
          isAmber
            ? 'bg-gradient-to-r from-amber-500/10 via-transparent to-transparent'
            : 'bg-gradient-to-r from-violet-500/10 via-transparent to-transparent'
        )}
      />

      {/* Icon container */}
      <div className="relative flex-shrink-0">
        {/* Glow */}
        <div
          className={cn(
            'absolute inset-0 rounded-lg blur-lg opacity-50',
            isAmber ? 'bg-amber-500/40' : 'bg-violet-500/40'
          )}
        />
        <div
          className={cn(
            'relative w-10 h-10 rounded-lg flex items-center justify-center',
            isAmber
              ? 'bg-gradient-to-br from-amber-400 to-orange-600'
              : 'bg-gradient-to-br from-violet-400 to-purple-600'
          )}
        >
          <Icon className="w-5 h-5 text-white drop-shadow" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 relative z-10">
        {/* Title + Badge */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-foreground truncate">{title}</span>
          <Badge
            className={cn(
              'text-[9px] px-1.5 py-0 h-4 font-bold border-0 shrink-0',
              'bg-gradient-to-r animate-gradient-x bg-[length:200%]',
              isAmber
                ? 'from-amber-500 via-orange-500 to-amber-500'
                : 'from-violet-500 via-primary to-violet-500'
            )}
          >
            SOON
          </Badge>
        </div>

        {/* Description - truncated */}
        <p className="text-[11px] text-muted-foreground truncate mb-1.5">{description}</p>

        {/* Chips - icons only */}
        <div className="flex gap-1.5">
          {chips.slice(0, 4).map((chip, i) => {
            const ChipIcon = chip.icon;
            return (
              <div
                key={i}
                className={cn(
                  'w-6 h-6 rounded-md flex items-center justify-center',
                  'bg-muted/30 border border-border/30',
                  isAmber ? 'text-amber-400' : 'text-violet-400'
                )}
              >
                <ChipIcon className="w-3 h-3" />
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
