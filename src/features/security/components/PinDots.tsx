import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PinDotsProps {
  length: number;
  maxLength?: number;
  error?: boolean;
  success?: boolean;
  className?: string;
}

const PinDots: React.FC<PinDotsProps> = ({
  length,
  maxLength = 6,
  error = false,
  success = false,
  className,
}) => {
  const dots = Array.from({ length: maxLength }, (_, i) => i);

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  };

  const successAnimation = {
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 },
  };

  return (
    <motion.div
      className={cn("flex items-center justify-center gap-4", className)}
      animate={error ? shakeAnimation : success ? successAnimation : {}}
    >
      {dots.map((index) => {
        const isFilled = index < length;
        
        return (
          <motion.div
            key={index}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-200",
              isFilled
                ? error
                  ? "bg-destructive border-destructive"
                  : success
                    ? "bg-green-500 border-green-500"
                    : "bg-primary border-primary"
                : "bg-transparent border-muted-foreground/40"
            )}
            initial={false}
            animate={
              isFilled
                ? {
                    scale: [1, 1.3, 1],
                    transition: { duration: 0.15 },
                  }
                : {}
            }
          />
        );
      })}
    </motion.div>
  );
};

export default PinDots;
