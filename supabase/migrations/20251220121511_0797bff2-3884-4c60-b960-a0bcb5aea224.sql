-- Create fcm_tokens table
CREATE TABLE public.fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, token)
);

-- Indexes for performance
CREATE INDEX idx_fcm_tokens_user_id ON public.fcm_tokens(user_id);
CREATE INDEX idx_fcm_tokens_active ON public.fcm_tokens(is_active) WHERE is_active = true;

-- RLS policies
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tokens" 
  ON public.fcm_tokens FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" 
  ON public.fcm_tokens FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" 
  ON public.fcm_tokens FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" 
  ON public.fcm_tokens FOR DELETE 
  USING (auth.uid() = user_id);

-- Add notification preference columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT true;