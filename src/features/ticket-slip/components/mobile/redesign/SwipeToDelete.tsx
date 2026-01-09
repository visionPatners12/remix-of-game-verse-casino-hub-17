import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}

export function SwipeToDelete({ children, onDelete, className }: SwipeToDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const x = useMotionValue(0);
  
  const deleteOpacity = useTransform(x, [-100, -50], [1, 0]);
  const deleteScale = useTransform(x, [-100, -50], [1, 0.8]);
  const backgroundOpacity = useTransform(x, [-100, 0], [0.15, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) {
      setIsDeleting(true);
      onDelete();
    }
  };

  if (isDeleting) {
    return (
      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Delete Background */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-end pr-6 bg-destructive/10"
        style={{ opacity: backgroundOpacity }}
      >
        <motion.div
          style={{ opacity: deleteOpacity, scale: deleteScale }}
          className="flex items-center gap-2 text-destructive"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-sm font-medium">Delete</span>
        </motion.div>
      </motion.div>

      {/* Swipeable Content */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-background cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}
