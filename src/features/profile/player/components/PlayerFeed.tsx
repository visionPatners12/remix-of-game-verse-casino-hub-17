import { Player } from '../types/player';
import { PlayerTransferRumours } from './PlayerTransferRumours';
import { PlayerRelatedNews } from './PlayerRelatedNews';

interface PlayerFeedProps {
  player: Player;
}

export function PlayerFeed({ player }: PlayerFeedProps) {
  const hasRumours = player.rumours?.current && player.rumours.current.length > 0;
  const hasNews = player.relatedNews && player.relatedNews.length > 0;
  const hasContent = hasRumours || hasNews;

  if (!hasContent) {
    return (
      <div className="px-4 py-6">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No posts yet</p>
          <p className="text-xs mt-1">Posts related to {player.fullName} will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Transfer Rumours */}
      {hasRumours && player.rumours && (
        <PlayerTransferRumours rumours={player.rumours} />
      )}
      
      {/* Related News */}
      {hasNews && player.relatedNews && (
        <PlayerRelatedNews news={player.relatedNews} />
      )}
    </div>
  );
}
