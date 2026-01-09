
import React from 'react';
import { Card, Badge, ScrollArea, ScrollBar, Avatar, AvatarFallback, AvatarImage } from "@/ui";
import { Play, Eye, Users, Trophy, User } from "lucide-react";

export function CompactLiveStreams() {
  const calls = []; // Simplified - empty for now
  const isLoading = false;

  if (isLoading) {
    return (
      <Card className="border border-border bg-card/30 hover:bg-card/50 rounded-xl cursor-pointer transition-all duration-300 group transform hover:scale-[1.01] shadow-subtle backdrop-blur-sm mb-4">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Streams</span>
            <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 animate-pulse">
                <div className="w-24 h-16 bg-muted rounded-xl mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-1"></div>
                <div className="h-2 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (calls.length === 0) {
    return null;
  }

  const handleStreamClick = (callId: string) => {
    window.location.href = `/live/view/${callId}`;
  };

  return (
    <Card className="border border-border bg-card/30 hover:bg-card/50 rounded-xl cursor-pointer transition-all duration-300 group transform hover:scale-[1.01] shadow-subtle backdrop-blur-sm mb-4">
      <div className="p-4">
        {/* Header avec nombre de streams live */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-foreground">Live Streams</span>
          <Badge variant="destructive" className="text-xs h-5 px-2 shadow-subtle transition-all duration-300 hover:shadow-destructive/30">
            {calls.length}
          </Badge>
        </div>

        {/* Streams horizontaux */}
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-2">
            {calls.map((call) => (
              <div 
                key={call.id}
                className="flex-shrink-0 w-40 cursor-pointer group"
                onClick={() => handleStreamClick(call.id)}
              >
                {/* Thumbnail du stream */}
                <div className="relative mb-3">
                  <div className="w-40 h-24 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-xl overflow-hidden border border-border/50 transition-all duration-300 group-hover:border-primary/50 group-hover:scale-[1.02] backdrop-blur-sm">
                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                      <Play className="w-6 h-6 text-white/80 group-hover:text-white transition-colors duration-300 mb-1" />
                      <div className="text-xs text-white/90 text-center font-medium truncate w-full">
                        {call.title}
                      </div>
                    </div>
                  </div>
                  
                  {/* Badge LIVE */}
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-subtle">
                      LIVE
                    </div>
                  </div>

                  {/* Nombre de viewers */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
                    <Eye className="w-3 h-3" />
                    {call.participant_count}
                  </div>
                </div>

                {/* Informations du stream */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                    {call.title}
                  </h4>
                  
                  {/* Créateur avec avatar (ou fallback) */}
                  <div className="flex items-center gap-2 mb-2">
                    {call.creator ? (
                      <>
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={call.creator.avatar_url} />
                          <AvatarFallback className="text-xs bg-primary/80 text-white">
                            {call.creator.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">
                          {call.creator.username}
                        </span>
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Streamer
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Description (si disponible) */}
                  {call.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {call.description}
                    </p>
                  )}
                  
                  {/* Hashtags (si disponibles) */}
                  {call.hashtags && call.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {call.hashtags.slice(0, 2).map((hashtag: string, index: number) => (
                        <span key={index} className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-lg border border-accent/20">
                          {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                        </span>
                      ))}
                      {call.hashtags.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{call.hashtags.length - 2}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Game ID (si disponible) */}
                  {call.game_id && (
                     <div className="flex items-center gap-1 text-accent">
                       <Trophy className="w-3 h-3" />
                       <span className="text-xs truncate">{call.game_id}</span>
                     </div>
                  )}
                  
                  {/* Statut public/privé */}
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="text-xs">{call.is_public ? 'Public' : 'Private'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </Card>
  );
}
