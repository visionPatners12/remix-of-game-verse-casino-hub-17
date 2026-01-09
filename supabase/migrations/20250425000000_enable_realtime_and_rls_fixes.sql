
-- Enable Realtime for game_sessions table (this is crucial for room connectivity)
alter table public.game_sessions replica identity full;
alter publication supabase_realtime add table public.game_sessions;

-- Enable Realtime for game_players table (for player presence)
alter table public.game_players replica identity full;
alter publication supabase_realtime add table public.game_players;

-- Enable Realtime for chat_messages table (for real-time chat)
alter table public.chat_messages replica identity full;
alter publication supabase_realtime add table public.chat_messages;

-- Create RLS policies for game_sessions if they don't exist
-- Allow anyone to read any room (necessary for public lobbies)
CREATE POLICY IF NOT EXISTS "Allow read access to all rooms" 
ON public.game_sessions 
FOR SELECT 
USING (true);

-- Allow creating rooms
CREATE POLICY IF NOT EXISTS "Allow insert to game_sessions"
ON public.game_sessions
FOR INSERT
WITH CHECK (true);

-- Allow updating rooms that user is in
CREATE POLICY IF NOT EXISTS "Allow update for rooms that user is in"
ON public.game_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.game_players
    WHERE session_id = game_sessions.id
    AND user_id = auth.uid()
  )
);

-- Create RLS policies for game_players if they don't exist
-- Allow reading any player's data
CREATE POLICY IF NOT EXISTS "Allow read access to all players" 
ON public.game_players 
FOR SELECT 
USING (true);

-- Allow users to update their own player data
CREATE POLICY IF NOT EXISTS "Allow users to update their own player data" 
ON public.game_players 
FOR UPDATE 
USING (user_id = auth.uid());

-- Allow users to insert their own player data
CREATE POLICY IF NOT EXISTS "Allow users to insert their own player data" 
ON public.game_players 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create RLS policies for chat_messages if they don't exist
-- Allow reading messages in rooms
CREATE POLICY IF NOT EXISTS "Allow read access to all chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

-- Allow inserting messages by authenticated users
CREATE POLICY IF NOT EXISTS "Allow users to insert chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable RLS on these tables if not already enabled
ALTER TABLE IF EXISTS public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.game_sessions IS 'Game sessions table with Realtime enabled for WebSocket functionality';
COMMENT ON TABLE public.game_players IS 'Game players table with Realtime enabled for presence tracking';
COMMENT ON TABLE public.chat_messages IS 'Chat messages with Realtime enabled for real-time messaging';
