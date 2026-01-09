import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HotBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const HotBadge: React.FC<HotBadgeProps> = ({ className, size = 'sm' }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "absolute top-2 left-2 z-10",
        "flex items-center gap-1 px-2 py-0.5 rounded-full",
        "bg-gradient-to-r from-orange-500 to-red-500",
        "text-white font-bold shadow-lg shadow-orange-500/30",
        size === 'sm' ? 'text-[9px]' : 'text-[10px]',
        className
      )}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity,
          repeatDelay: 1
        }}
      >
        <Flame className={cn(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
      </motion.div>
      HOT
    </motion.div>
  );
};
