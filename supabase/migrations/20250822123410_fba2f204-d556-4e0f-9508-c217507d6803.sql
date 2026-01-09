-- Add stream synchronization timestamp to leagues table
ALTER TABLE public.leagues 
ADD COLUMN stream_synced_at TIMESTAMP WITH TIME ZONE;