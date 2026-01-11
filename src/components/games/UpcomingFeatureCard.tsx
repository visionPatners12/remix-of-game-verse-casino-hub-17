import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Check, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface UpcomingFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  iconGradient?: string;
  onNotifyMe?: () => void;
  showNotify?: boolean;
}

export const UpcomingFeatureCard = ({
  icon: Icon,
  title,
  description,
  features,
  gradient,
  iconGradient = "from-primary to-primary/70",
  showNotify = true,
}: UpcomingFeatureCardProps) => {
  const { t } = useTranslation('games');

  const handleNotifyMe = () => {
    toast.success(t('notifySuccess', 'You\'ll be notified when available!'), {
      description: title,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5",
        "bg-gradient-to-br border border-white/10",
        "transition-shadow duration-300",
        "hover:shadow-xl hover:shadow-primary/10",
        gradient
      )}
    >
      {/* SOON Badge */}
      <Badge 
        className="absolute top-3 right-3 text-[10px] px-2 py-0.5 font-bold bg-primary text-primary-foreground border-0 animate-pulse"
      >
        {t('soon')}
      </Badge>

      {/* Icon */}
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.4 }}
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
          "bg-gradient-to-br shadow-lg",
          iconGradient
        )}
      >
        <Icon className="w-7 h-7 text-white" />
      </motion.div>

      {/* Title & Description */}
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {/* Features List */}
      <ul className="space-y-2 mb-4">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="flex items-center gap-2 text-sm text-foreground/80"
          >
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>

      {/* Notify Button */}
      {showNotify && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNotifyMe}
          className="w-full gap-2 bg-background/50 hover:bg-background/80 border-white/20"
        >
          <Bell className="w-4 h-4" />
          {t('notifyMe', 'Notify me')}
        </Button>
      )}

      {/* Decorative glow */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
};
