import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { LudoRoomCard, LudoRoomCardSkeleton } from './LudoRoomCard';

interface Player {
  id: string;
  color: 'red' | 'green' | 'yellow' | 'blue';
  user?: {
    username?: string;
    avatar_url?: string;
  };
}

interface Room {
  id: string;
  room_code: string;
  max_players: number;
  bet_amount: number | null;
  pot: number | null;
  players: Player[];
}

interface LudoRoomsListProps {
  rooms: Room[];
  loading: boolean;
}

export const LudoRoomsList: React.FC<LudoRoomsListProps> = ({ rooms, loading }) => {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Open Rooms
        </h2>
        {!loading && rooms.length > 0 && (
          <span className="text-xs text-muted-foreground/60">
            ({rooms.length})
          </span>
        )}
      </div>

      {/* Content - no spacing between items, dividers handled by cards */}
      <div>
        {loading ? (
          // Loading skeletons
          <>
            <LudoRoomCardSkeleton />
            <LudoRoomCardSkeleton />
            <LudoRoomCardSkeleton />
          </>
        ) : rooms.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No open rooms
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Create a game to start playing
            </p>
          </motion.div>
        ) : (
          // Room list items
          rooms.map((room, index) => (
            <LudoRoomCard
              key={room.id}
              id={room.id}
              room_code={room.room_code || 'N/A'}
              players={room.players}
              max_players={room.max_players || 4}
              bet_amount={room.bet_amount}
              pot={room.pot}
              index={index}
              isLast={index === rooms.length - 1}
            />
          ))
        )}
      </div>
    </section>
  );
};
