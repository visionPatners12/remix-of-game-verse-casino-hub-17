
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, AvatarImage, Skeleton } from "@/ui";
import { ScrollArea } from "@/ui";
import { SoonOverlay } from "@/components/ui/SoonOverlay";
import { 
  TrendingUp, 
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTrendingTopics } from '@/features/search/hooks/useTrendingTopics';
import { useLeaderboardData } from '@/features/tipster/hooks/useLeaderboardData';

export function OptimizedSidebar() {
  return (
    <div className="space-y-4 w-full">
      {/* Lien vers la page Progression unifiée */}
      <ProgressionLinkCard />
      
      {/* Top Tipsters - Version ultra responsive */}
      <TopTipstersCard />
      
      {/* Tendances */}
      <TrendsCard />
    </div>
  );
}

// Lien vers la page Progression unifiée
function ProgressionLinkCard() {
  return (
    <SoonOverlay enabled={true}>
      <Card className="border border-border bg-card/30 rounded-xl cursor-pointer transition-all duration-300 group shadow-subtle backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">My Progress</h3>
                <p className="text-xs text-muted-foreground">Challenges • Achievements • Score</p>
              </div>
            </div>
          </div>
          
          {/* Aperçu rapide */}
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>2 active challenges</span>
              <span>Score: 1,247</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1.5 mt-1">
              <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" style={{ width: '74%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </SoonOverlay>
  );
}

// Top Tipsters - Ultra responsive
function TopTipstersCard() {
  const navigate = useNavigate();
  const { data: tipsters, isLoading } = useLeaderboardData('all', 'all');
  const topTipsters = tipsters?.slice(0, 4) || [];


  const renderFormBadges = (form: ('W' | 'L')[]) => {
    return form.slice(0, 5).map((result, i) => (
      <span
        key={i}
        className={`w-3 h-3 text-[8px] font-bold flex items-center justify-center rounded ${
          result === 'W' 
            ? 'bg-green-500/20 text-green-500' 
            : 'bg-red-500/20 text-red-500'
        }`}
      >
        {result}
      </span>
    ));
  };

  if (isLoading) {
    return (
      <Card className="border border-border bg-card/30 rounded-xl shadow-subtle backdrop-blur-sm">
        <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="text-sm sm:text-base text-foreground">Top Tipsters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card/30 hover:bg-card/50 rounded-xl cursor-pointer transition-all duration-300 group transform hover:scale-[1.01] shadow-subtle backdrop-blur-sm">
      <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400 group-hover:text-amber-300 transition-colors duration-300" />
          <span className="text-sm sm:text-base text-foreground">Top Tipsters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 space-y-2 sm:space-y-3">
        {/* Version Mobile - Scroll horizontal */}
        <div className="block sm:hidden">
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {topTipsters.map((tipster, index) => (
                <motion.div 
                  key={tipster.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/user/${tipster.username || tipster.id}`)}
                  className="flex-shrink-0 w-28 p-3 rounded-xl bg-card/30 hover:bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={tipster.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${tipster.name}`} />
                        <AvatarFallback className="text-xs bg-primary/80 text-white">
                          {tipster.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center bg-accent text-accent-foreground border border-accent/20"
                        >
                          {index + 1}
                        </Badge>
                      )}
                    </div>
                    <div className="w-full space-y-0.5">
                      <p className="text-xs font-medium truncate text-foreground">{tipster.name}</p>
                      <div className="flex gap-0.5 justify-center">
                        {renderFormBadges(tipster.form)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Version Desktop - Liste verticale */}
        <div className="hidden sm:block space-y-2">
          {topTipsters.map((tipster, index) => (
            <motion.div 
              key={tipster.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/user/${tipster.username || tipster.id}`)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-card/30 border border-transparent hover:border-border/50 transition-all duration-300 cursor-pointer group backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={tipster.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${tipster.name}`} />
                    <AvatarFallback className="text-xs bg-primary/80 text-white">
                      {tipster.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center bg-accent text-accent-foreground border border-accent/20"
                    >
                      {index + 1}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors duration-300">{tipster.name}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span>{tipster.totalTips} tips</span>
                    <span>•</span>
                    <span>{tipster.winRate.toFixed(0)}% WR</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {renderFormBadges(tipster.form)}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">{tipster.openTips} open</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Tendances Communauté
function TrendsCard() {
  const { topics, isLoading } = useTrendingTopics({ 
    maxResults: 6,
    minPosts: 1 
  });

  return (
    <Card className="border border-border bg-card/30 hover:bg-card/50 rounded-xl cursor-pointer transition-all duration-300 group transform hover:scale-[1.01] shadow-subtle backdrop-blur-sm">
      <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500 group-hover:text-blue-400 transition-colors duration-300" />
          <span className="text-sm sm:text-base text-foreground">Trending</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {/* Version Mobile - Grid 2 colonnes */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-2 gap-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center p-3 bg-card/30 rounded-xl border border-border/50 animate-pulse">
                  <div className="h-4 w-20 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-12 bg-muted rounded"></div>
                </div>
              ))
            ) : topics.length === 0 ? (
              <div className="col-span-2 text-center text-xs text-muted-foreground py-4">
                No trending hashtags
              </div>
            ) : (
              topics.map((trend, index) => (
                <div key={index} className="flex flex-col items-center p-3 bg-card/30 hover:bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                  <span className="text-xs font-medium text-center text-foreground">{trend.text}</span>
                  <span className="text-xs text-muted-foreground">{trend.posts}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Version Desktop - Liste simple */}
        <div className="hidden sm:block">
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl animate-pulse">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-12 bg-muted rounded"></div>
                  </div>
                ))
              ) : topics.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-4">
                  No trending hashtags
                </div>
              ) : (
                topics.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-card/30 border border-transparent hover:border-border/50 transition-all duration-300 cursor-pointer group backdrop-blur-sm">
                    <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors duration-300">{trend.text}</span>
                    <span className="text-xs text-muted-foreground">{trend.posts}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
