import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  bottomAction?: React.ReactNode;
  showBackground?: boolean;
  backgroundVariant?: 'purple' | 'amber' | 'emerald' | 'blue';
}

const backgroundColors = {
  purple: {
    primary: 'from-primary/20 to-primary/5',
    secondary: 'from-accent/20 to-accent/5'
  },
  amber: {
    primary: 'from-amber-500/20 to-orange-500/5',
    secondary: 'from-primary/20 to-primary/5'
  },
  emerald: {
    primary: 'from-emerald-500/20 to-green-500/5',
    secondary: 'from-blue-500/20 to-blue-600/5'
  },
  blue: {
    primary: 'from-blue-500/20 to-blue-600/5',
    secondary: 'from-primary/20 to-primary/5'
  }
};

export function OnboardingLayout({ 
  children, 
  bottomAction, 
  showBackground = true,
  backgroundVariant = 'purple' 
}: OnboardingLayoutProps) {
  const colors = backgroundColors[backgroundVariant];

  return (
    <div 
      className="min-h-screen bg-background flex flex-col relative overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* Animated background */}
      {showBackground && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className={`absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br ${colors.primary} rounded-full blur-3xl`}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className={`absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br ${colors.secondary} rounded-full blur-3xl`}
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
      )}

      {/* Main content area - scrollable */}
      <div className="flex-1 flex flex-col overflow-y-auto overscroll-contain relative z-10">
        {children}
      </div>

      {/* Fixed bottom action - with safe area */}
      {bottomAction && (
        <div 
          className="sticky bottom-0 z-50 bg-gradient-to-t from-background via-background/95 to-transparent pt-6"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
          }}
        >
          <div className="px-5 max-w-md mx-auto w-full">
            {bottomAction}
          </div>
        </div>
      )}
    </div>
  );
}
