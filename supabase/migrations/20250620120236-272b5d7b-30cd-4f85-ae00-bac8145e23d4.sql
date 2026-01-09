
-- Drop chat-related tables since we're migrating to Stream API
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_words CASCADE;
DROP TABLE IF EXISTS public.chat_gifs CASCADE;

-- Drop direct messages table as it will be handled by Stream
DROP TABLE IF EXISTS public.direct_messages CASCADE;
