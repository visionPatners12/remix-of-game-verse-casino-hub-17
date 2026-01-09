import React from "react";
import { TeamDisplay } from "./TeamDisplay";
import { StyledOddsDisplay } from "@/features/social-feed/components/shared/StyledOddsDisplay";
import { ReactionBar } from "@/features/social-feed/components/shared/ReactionBar";
import { CommentSection, type Comment } from "@/features/social-feed/components/shared/CommentSection";

import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AvatarFallback as ThemeAvatarFallback } from "@/components/ui/avatar-fallback";
import { getSportById } from "@/lib/sportsMapping";
import { useLiveStats } from "@/features/sports/hooks/useLiveStats";

import type { MatchCardProps } from "@/features/sports/types";
import type { ReactionCounts } from '@/types/feed';

interface LiveFeedCardProps extends MatchCardProps {
  reactions?: ReactionCounts;
  comments?: Comment[];
  showComments?: boolean;
  isLoadingComments?: boolean;
  onAddComment?: (text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => void;
  onToggleComments?: () => void;
  onLike?: () => void;
}

export function LiveFeedCard({ 
  match, 
  onClick,
  reactions,
  comments = [],
  showComments = false,
  isLoadingComments = false,
  onAddComment,
  onToggleComments,
  onLike
}: LiveFeedCardProps) {
  const teamA = match.participants?.[0] ? {
    name: match.participants[0].name,
    image: match.participants[0].image
  } : undefined;
  
  const teamB = match.participants?.[1] ? {
    name: match.participants[1].name,
    image: match.participants[1].image
  } : undefined;

  // Récupérer les informations du sport - priorité à sportId puis slug
  const sport = match.sport as { sportId?: number | string; slug?: string; name?: string } | undefined;
  const sportInfo = getSportById(sport?.sportId || sport?.slug, sport?.name);
  const isTennisOrVolley = sportInfo.slug === 'tennis' || sportInfo.slug === 'volleyball';
  const isSoccer = sportInfo.slug === 'soccer' || sportInfo.slug === 'football';
  const isBasketball = sportInfo.slug === 'basketball';

  // Utiliser les statistiques live
  const liveStats = useLiveStats(match, sportInfo?.slug);

  // Ne pas afficher de scores fallback - seulement les vraies données
  const homeScore = isTennisOrVolley ? liveStats.setsWon.home :
                   isSoccer ? liveStats.soccerGoals?.home :
                   isBasketball ? liveStats.basketballTotal?.home :
                   null;
  const awayScore = isTennisOrVolley ? liveStats.setsWon.away :
                   isSoccer ? liveStats.soccerGoals?.away :
                   isBasketball ? liveStats.basketballTotal?.away :
                   null;
  const currentSet = liveStats.currentSet;


  const TeamAvatar = ({ team, variant }: { team?: typeof teamA; variant: "A" | "B" }) => (
    <Avatar className="w-7 h-7 ring-1 ring-border/20 relative z-10">
      <AvatarImage 
        src={team?.image || undefined} 
        alt={team?.name || `Équipe ${variant}`}
      />
      <AvatarFallback asChild>
        <ThemeAvatarFallback 
          name={team?.name || `Team ${variant}`}
          variant="team"
          size="sm"
        />
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div 
      className="hover:bg-muted/30 transition-all duration-200 cursor-pointer border-b border-border/10 last:border-b-0 px-4 py-4 bg-gradient-to-r from-red-500/5 to-transparent"
      onClick={onClick}
    >
      {/* Sport et Ligue */}
      <div className="flex items-center gap-2 mb-3">
        {sportInfo.icon && (
          <div className="text-xs text-muted-foreground">
            <sportInfo.icon className="h-3 w-3" />
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-1">
          <span className="font-medium">{sportInfo.name}</span>
          {(match.league as { name?: string })?.name && (
            <>
              <span>•</span>
              <span className="truncate">{(match.league as { name?: string }).name}</span>
            </>
          )}
        </div>
        
        {/* Set actuel pour tennis/volleyball */}
        {isTennisOrVolley && currentSet && (
          <motion.div 
            className="flex items-center gap-1 text-red-600 font-semibold text-xs"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span>Set {currentSet}</span>
          </motion.div>
        )}

        {/* Temps de jeu pour football et basketball */}
        {(isSoccer || isBasketball) && liveStats.gameTime && (
          <motion.div 
            className="flex items-center gap-1 text-red-600 font-semibold text-xs"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Clock className="h-3 w-3" />
            <span>{liveStats.gameTime}</span>
          </motion.div>
        )}
      </div>

      {/* Teams avec scores - même structure que TeamDisplay */}
      <div className="flex-1 flex items-center gap-3 mb-4">
        {/* Logos avec chevauchement - même style que TeamDisplay */}
        <div className="relative flex items-center">
          <TeamAvatar team={teamA} variant="A" />
          
          <div className="relative -ml-2 z-5">
            <TeamAvatar team={teamB} variant="B" />
          </div>
        </div>

        {/* Noms et scores */}
        <div className="flex gap-1 flex-1 min-w-0">
          {isTennisOrVolley ? (
            sportInfo.slug === 'tennis' ? (
              /* Tennis : noms à gauche, rectangles à droite */
              <div className="flex items-center justify-between w-full">
                {/* Noms des équipes à gauche */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {teamA?.name || "Équipe A"}
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground truncate">
                    {teamB?.name || "Équipe B"}
                  </div>
                </div>
                
                {/* Rectangles de score à droite */}
                <div className="flex flex-col gap-0.5 ml-2">
                  {/* Équipe A */}
                  <div className="flex gap-1">
                    {/* Sets gagnés */}
                    <div className="w-7 h-6 bg-foreground text-background text-xs font-bold rounded-sm flex items-center justify-center">
                      {liveStats.setsWon.home}
                    </div>
                    {/* Jeux du set en cours */}
                    <div className="w-7 h-6 bg-muted-foreground/80 text-background text-xs font-bold rounded-sm flex items-center justify-center">
                      {liveStats.currentSetScore.home}
                    </div>
                    {/* Points du jeu */}
                    <div className="w-7 h-6 bg-muted text-foreground text-xs font-bold rounded-sm flex items-center justify-center">
                      {liveStats.gamePoints?.home || 0}
                    </div>
                  </div>
                  
                  {/* Équipe B */}
                  <div className="flex gap-1">
                    {/* Sets gagnés */}
                    <div className="w-7 h-6 bg-muted-foreground/60 text-background text-xs font-bold rounded-sm flex items-center justify-center">
                      {liveStats.setsWon.away}
                    </div>
                    {/* Jeux du set en cours */}
                    <div className="w-7 h-6 bg-muted-foreground/40 text-foreground text-xs font-bold rounded-sm flex items-center justify-center">
                      {liveStats.currentSetScore.away}
                    </div>
                    {/* Points du jeu */}
                    <div className="w-7 h-6 bg-muted/60 text-muted-foreground text-xs font-bold rounded-sm flex items-center justify-center">
                      {liveStats.gamePoints?.away || 0}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Volleyball : noms à gauche, rectangles à droite */
              <div className="flex items-center justify-between w-full">
                {/* Noms des équipes à gauche */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {teamA?.name || "Équipe A"}
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground truncate">
                    {teamB?.name || "Équipe B"}
                  </div>
                </div>
                
                {/* Rectangles de score à droite */}
                <div className="flex flex-col gap-0.5 ml-2">
                  {/* Équipe A */}
                  <div className="flex gap-1">
                    {/* Sets gagnés */}
                    <div className="w-7 h-6 bg-foreground text-background text-xs font-bold rounded-sm flex items-center justify-center">
                      {liveStats.setsWon.home}
                    </div>
                    {/* Points du set en cours */}
                    <div className="w-7 h-6 bg-muted-foreground/80 text-background text-xs font-bold rounded-sm flex items-center justify-center">
                      {liveStats.currentSetScore.home}
                    </div>
                  </div>
                  
                  {/* Équipe B */}
                  <div className="flex gap-1">
                    {/* Sets gagnés */}
                    <div className="w-7 h-6 bg-muted-foreground/60 text-background text-xs font-bold rounded-sm flex items-center justify-center">
                      {liveStats.setsWon.away}
                    </div>
                    {/* Points du set en cours */}
                    <div className="w-7 h-6 bg-muted-foreground/40 text-foreground text-xs font-bold rounded-sm flex items-center justify-center">
                      {liveStats.currentSetScore.away}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Affichage simple pour autres sports - structure verticale cohérente */
            (homeScore !== null && awayScore !== null) ? (
              <div className="flex items-center justify-between w-full">
                {/* Noms des équipes empilés verticalement */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {teamA?.name || "Équipe A"}
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground truncate">
                    {teamB?.name || "Équipe B"}
                  </div>
                </div>
                
                {/* Scores alignés à droite */}
                <div className="flex flex-col gap-0.5 ml-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-foreground">
                    {homeScore}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {awayScore}
                  </span>
                </div>
              </div>
            ) : (
              /* Affichage sans scores - structure verticale cohérente */
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {teamA?.name || "Équipe A"}
                </div>
                <div className="text-sm font-semibold text-muted-foreground truncate">
                  {teamB?.name || "Équipe B"}
                </div>
              </div>
            )
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <StyledOddsDisplay 
          gameId={match.gameId}
          participants={[teamA, teamB].filter(Boolean)}
          sport={typeof match.sport === 'object' ? { name: (match.sport as any).name || sportInfo.name, slug: (match.sport as any).slug || sportInfo.slug } : { name: sportInfo.name, slug: sportInfo.slug }}
          league={typeof match.league === 'object' ? { name: (match.league as any).name || '', slug: (match.league as any).slug || '', logo: (match.league as any).logo } : undefined}
          startsAt={match.startsAt as string}
        />
      </div>

      {/* Barre de réaction */}
      <ReactionBar
        likes={reactions?.likes || 0}
        comments={reactions?.comments || 0}
        userLiked={reactions?.userLiked || false}
        postId={match.gameId}
        onLike={onLike}
        onComment={onToggleComments}
      />

      {/* Section commentaires */}
      <div onClick={(e) => e.stopPropagation()}>
        <CommentSection
          comments={comments}
          onAddComment={onAddComment}
          showComments={showComments}
          isLoadingComments={isLoadingComments}
        />
      </div>
    </div>
  );
}