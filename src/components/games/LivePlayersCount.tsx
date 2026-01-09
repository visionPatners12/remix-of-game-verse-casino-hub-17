import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LivePlayersCountProps {
  count: number;
  className?: string;
}

export const LivePlayersCount: React.FC<LivePlayersCountProps> = ({ count, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-1 text-[10px] text-muted-foreground",
        className
      )}
    >
      <div className="relative">
        <Users className="w-3 h-3" />
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <span className="font-medium">{count}</span>
    </motion.div>
  );
};
