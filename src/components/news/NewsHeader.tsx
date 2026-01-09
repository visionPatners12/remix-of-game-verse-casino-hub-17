
import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/ui';

export const NewsHeader = () => {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/30">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Newspaper className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Actualités</h1>
          </div>
          
          <p className="text-lg text-muted-foreground mb-6">
            Restez informé des dernières actualités de notre plateforme, 
            des guides exclusifs et des événements à venir.
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Mis à jour quotidiennement</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Par notre équipe d'experts</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
