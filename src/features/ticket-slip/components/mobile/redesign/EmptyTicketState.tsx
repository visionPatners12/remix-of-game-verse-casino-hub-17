import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EmptyTicketStateProps {
  className?: string;
}

export function EmptyTicketState({ className }: EmptyTicketStateProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {/* Animated Ticket Icon */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [0, -5, 5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Ticket className="h-10 w-10 text-primary" />
        </div>
        
        {/* Floating Sparkles */}
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: [-10, -20, -10]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5
          }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="h-5 w-5 text-primary" />
        </motion.div>
      </motion.div>

      {/* Text */}
      <h3 className="text-xl font-bold text-foreground mb-2">
        Your ticket is empty
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Browse matches and tap on odds to add selections to your ticket
      </p>

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/sports')}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-xl",
          "bg-primary text-primary-foreground font-semibold",
          "shadow-lg shadow-primary/25",
          "transition-colors hover:bg-primary/90"
        )}
      >
        <span>Browse Matches</span>
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
