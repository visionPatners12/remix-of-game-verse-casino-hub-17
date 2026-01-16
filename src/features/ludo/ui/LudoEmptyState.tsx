import React from 'react';
import { motion } from 'framer-motion';
import { Dice5, Users, History, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LudoEmptyStateProps {
  type: 'available' | 'history';
}

export const LudoEmptyState: React.FC<LudoEmptyStateProps> = ({ type }) => {
  const navigate = useNavigate();
  
  const isHistory = type === 'history';
  const Icon = isHistory ? History : Users;
  const title = isHistory ? 'No game history yet' : 'No games available';
  const description = isHistory 
    ? 'Your completed games will appear here'
    : 'Create your first game or wait for others to join';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      {/* Animated dice illustration */}
      <div className="relative mb-6">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            y: [0, -5, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <Icon className="w-10 h-10 text-muted-foreground/50" />
          </div>
          
          {/* Floating mini dice */}
          {!isHistory && (
            <>
              <motion.div
                animate={{ 
                  y: [-2, 2, -2],
                  rotate: [0, 15, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-ludo-red/20 flex items-center justify-center"
              >
                <Dice5 className="w-3 h-3 text-ludo-red" />
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [2, -2, 2],
                  rotate: [0, -10, 0]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-2 -left-2 w-6 h-6 rounded-lg bg-ludo-blue/20 flex items-center justify-center"
              >
                <Dice5 className="w-3 h-3 text-ludo-blue" />
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
      
      {/* Text */}
      <h3 className="font-semibold text-foreground text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-[240px] mb-6">
        {description}
      </p>
      
      {/* CTA for available tab */}
      {!isHistory && (
        <Button 
          onClick={() => navigate('/games/ludo/create')}
          className="gap-2"
        >
          Create your first game
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
};
