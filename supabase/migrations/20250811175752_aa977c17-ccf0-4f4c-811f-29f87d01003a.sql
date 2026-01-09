-- Create tipster subscriptions table
CREATE TABLE public.tipster_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL,
  tipster_id UUID NOT NULL,
  amount DECIMAL NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(subscriber_id, tipster_id, status)
);

-- Enable RLS
ALTER TABLE public.tipster_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tipster_subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.tipster_subscriptions FOR SELECT
USING (auth.uid() = subscriber_id);

CREATE POLICY "Tipsters can view their subscribers"
ON public.tipster_subscriptions FOR SELECT
USING (auth.uid() = tipster_id);

CREATE POLICY "Users can create their own subscriptions"
ON public.tipster_subscriptions FOR INSERT
WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.tipster_subscriptions FOR UPDATE
USING (auth.uid() = subscriber_id);

-- Update user_wallet RLS to allow viewing tipster addresses for active tipsters
CREATE POLICY "Allow viewing active tipster wallet addresses"
ON public.user_wallet FOR SELECT
USING (
  user_id IN (
    SELECT user_id FROM public.tipsters WHERE is_active = true
  )
);

-- Add trigger for updating timestamps
CREATE TRIGGER update_tipster_subscriptions_updated_at
BEFORE UPDATE ON public.tipster_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();