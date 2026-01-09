import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { BasePost } from '@/features/social-feed/components/posts/base/BasePost';
import { TeamLink } from '@/features/social-feed/components/shared/TeamLink';
import type { PostComponentProps, HighlightPost } from '@/types/posts';
import SmartVideoContainer from '@/components/ui/SmartVideoContainer';

import { cn } from '@/lib/utils';
import { parseHighlightScore, type HighlightMatchScore } from '@/features/highlights/utils/parseScore';

/**
 * Highlight post component - KISS: Native display with separator lines
 */
export function HighlightPostComponent(props: PostComponentProps<HighlightPost>) {
  const { post } = props;
  const highlight = post.highlightContent;
  const navigate = useNavigate();

  if (!highlight) {
    return (
      <BasePost {...props}>
        <div className="text-sm text-foreground">{post.content}</div>
      </BasePost>
    );
  }

  const { match, video, data } = highlight;
  const duration = data?.duration;

  // Debug log to trace video data
  console.log('[Highlight Debug]', { 
    postId: post.id, 
    hasVideo: !!video, 
    videoUrl: video?.url,
    embedUrl: highlight?.data?.embed_url 
  });

  // Use unified score parser
  const parsedScore = parseHighlightScore(match?.score as HighlightMatchScore);
  const hasScore = parsedScore.home !== null && parsedScore.away !== null;

  return (
    <BasePost {...props}>
      <div className="relative">

        {/* Match info with team logos and score */}
        {match && (
          <div className="pb-2 pt-2 border-b border-border/40">
            {/* Stage and round info */}
            {(match.stage || match.round) && (
              <div className="text-xs text-muted-foreground text-center mb-2">
                {match.stage}
                {match.stage && match.round && ' • '}
                {match.round}
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              {/* Home team - CLICKABLE */}
              <div className="flex flex-col items-center gap-2 flex-1">
                {match.homeTeamLogo && (
                  <TeamLink teamName={match.homeTeam} teamId={match.homeTeamId} className="relative cursor-pointer">
                    <img 
                      src={match.homeTeamLogo} 
                      alt={match.homeTeam}
                      className="w-10 h-10 object-contain drop-shadow-md hover:scale-110 transition-transform"
                    />
                  </TeamLink>
                )}
                <TeamLink 
                  teamName={match.homeTeam} 
                  teamId={match.homeTeamId}
                  className="text-xs font-semibold text-center line-clamp-2"
                >
                  {match.homeTeam}
                </TeamLink>
              </div>

              {/* Score or VS + Match button */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "px-4 py-2 rounded-xl font-bold",
                  hasScore 
                    ? "text-xl bg-gradient-to-br from-muted/80 to-muted/40 text-foreground shadow-inner" 
                    : "text-sm text-muted-foreground"
                )}>
                  {hasScore ? `${parsedScore.home} - ${parsedScore.away}` : 'VS'}
                </div>
                
                {/* Match button - use fixtureId for navigation */}
                {match.fixtureId && (
                  <button
                    onClick={() => navigate(`/match-details/${match.fixtureId}`)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View match
                  </button>
                )}
              </div>

              {/* Away team - CLICKABLE */}
              <div className="flex flex-col items-center gap-2 flex-1">
                {match.awayTeamLogo && (
                  <TeamLink teamName={match.awayTeam} teamId={match.awayTeamId} className="relative cursor-pointer">
                    <img 
                      src={match.awayTeamLogo} 
                      alt={match.awayTeam}
                      className="w-10 h-10 object-contain drop-shadow-md hover:scale-110 transition-transform"
                    />
                  </TeamLink>
                )}
                <TeamLink 
                  teamName={match.awayTeam} 
                  teamId={match.awayTeamId}
                  className="text-xs font-semibold text-center line-clamp-2"
                >
                  {match.awayTeam}
                </TeamLink>
              </div>
            </div>
          </div>
        )}

        {/* Video player with overlay gradient */}
        {video && (
          <div className="relative -mx-4 my-2 group">
            {/* Top gradient overlay */}
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background/60 to-transparent z-10 pointer-events-none" />
            
            <SmartVideoContainer
              url={video.url}
              poster={video.thumbnail}
              ariaLabel="Watch highlight"
              className="w-full"
            />
            
            {/* Bottom gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none" />
            
            {/* Duration badge */}
            {duration && (
              <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground">
                {String(duration)}
              </div>
            )}
            
          </div>
        )}

        {/* Content text */}
        {post.content && (
          <div className="pt-2 border-t border-border/40 text-sm text-foreground/90 leading-relaxed">
            {post.content}
          </div>
        )}
      </div>
    </BasePost>
  );
}

HighlightPostComponent.displayName = 'HighlightPostComponent';
