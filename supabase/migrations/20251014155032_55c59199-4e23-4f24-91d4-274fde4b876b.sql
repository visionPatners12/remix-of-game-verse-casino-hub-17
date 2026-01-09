-- Add stream_activity_id to bets table for GetStream integration
ALTER TABLE public.bets 
ADD COLUMN IF NOT EXISTS stream_activity_id text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bets_stream_activity_id 
ON public.bets(stream_activity_id);

COMMENT ON COLUMN public.bets.stream_activity_id IS 'GetStream activity ID for bidirectional sync';
