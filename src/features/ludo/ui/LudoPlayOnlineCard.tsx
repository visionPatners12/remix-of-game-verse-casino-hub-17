import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Zap, Users, Target, Gamepad2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const features = [
  { icon: Target, label: 'Instant Match' },
  { icon: Users, label: 'Ranked' },
  { icon: Gamepad2, label: 'With Friends' },
  { icon: Zap, label: 'Stake & Play' },
];

export const LudoPlayOnlineCard: React.FC = () => {
  const { t } = useTranslation('games');
  
  const handleNotify = () => {
    toast.success(t('notifySuccess', "You'll be notified when available!"), {
      icon: <Bell className="w-4 h-4" />,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-500/20 p-4"
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent animate-shimmer" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Swords className="w-6 h-6 text-white" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{t('upcoming.playOnline.title', 'Play Online')}</h3>
                <Badge 
                  variant="secondary" 
                  className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px] px-1.5 py-0 animate-pulse"
                >
                  SOON
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('upcoming.playOnline.description', 'Instant matchmaking')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20"
            >
              <feature.icon className="w-3 h-3 text-violet-400" />
              <span className="text-[11px] font-medium text-violet-300">{feature.label}</span>
            </motion.div>
          ))}
        </div>
        
        {/* Notify Button */}
        <Button 
          onClick={handleNotify}
          variant="outline" 
          size="sm" 
          className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
        >
          <Bell className="w-4 h-4 mr-2" />
          {t('notifyMe', 'Notify me')}
        </Button>
      </div>
    </motion.div>
  );
};
