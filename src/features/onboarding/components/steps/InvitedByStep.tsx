import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Gift, ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '../../types';

export interface ReferrerInfo {
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

interface InvitedByStepProps extends OnboardingStepProps {
  referrerInfo: ReferrerInfo;
}

export function InvitedByStep({ referrerInfo, onNext }: InvitedByStepProps) {
  const fullName = [referrerInfo.firstName, referrerInfo.lastName]
    .filter(Boolean)
    .join(' ') || referrerInfo.username || 'User';
  
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center space-y-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4"
          >
            <UserCheck className="w-6 h-6 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">
            Vous avez été invité !
          </h1>
          <p className="text-muted-foreground">
            Bienvenue sur PRYZEN
          </p>
        </div>

        {/* Referrer Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl rounded-3xl" />
          
          <div className="relative bg-card border border-border rounded-2xl p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Invité par</p>
            
            {/* Avatar with gradient border */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-full blur-sm opacity-75" />
                <Avatar className="relative w-24 h-24 border-4 border-background">
                  <AvatarImage 
                    src={referrerInfo.avatarUrl || undefined} 
                    alt={fullName} 
                  />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Name and username */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">
                {fullName}
              </h2>
              {referrerInfo.username && (
                <p className="text-muted-foreground">
                  @{referrerInfo.username}
                </p>
              )}
            </div>

            {/* Welcome bonus badge */}
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              <Gift className="w-3 h-3 mr-1" />
              Bonus de bienvenue
            </Badge>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Button 
            onClick={onNext} 
            size="lg" 
            className="w-full gap-2"
          >
            Continuer
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
