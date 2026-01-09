
-- Add channel_name column to chat_messages
ALTER TABLE public.chat_messages 
ADD COLUMN channel_name text NOT NULL DEFAULT 'general';

-- Add is_special column for highlighting special messages
ALTER TABLE public.chat_messages 
ADD COLUMN is_special boolean NOT NULL DEFAULT false;

-- Enable RLS on chat_messages table if not already enabled
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading all chat messages
CREATE POLICY IF NOT EXISTS "Allow reading all chat messages"
ON public.chat_messages
FOR SELECT
USING (true);

-- Create policy to allow authenticated users to insert chat messages
CREATE POLICY IF NOT EXISTS "Allow inserting chat messages when authenticated"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add Realtime support for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Create an index on channel_name to improve query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_name ON public.chat_messages(channel_name);

COMMENT ON COLUMN public.chat_messages.channel_name IS 'Identifies which chat channel this message belongs to';
COMMENT ON COLUMN public.chat_messages.is_special IS 'Whether the message should be highlighted as special';
