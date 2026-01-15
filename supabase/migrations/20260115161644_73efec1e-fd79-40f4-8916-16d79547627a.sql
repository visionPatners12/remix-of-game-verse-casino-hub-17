-- Table pour cacher les transactions Privy
CREATE TABLE public.privy_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_id TEXT NOT NULL,
  chain TEXT NOT NULL,
  asset TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  privy_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  type TEXT,
  sender TEXT,
  recipient TEXT,
  raw_value TEXT,
  raw_value_decimals INTEGER,
  display_value TEXT,
  caip2 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  privy_created_at BIGINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(transaction_hash, chain)
);

-- Index pour les recherches rapides
CREATE INDEX idx_privy_transactions_user_id ON public.privy_transactions(user_id);
CREATE INDEX idx_privy_transactions_wallet_id ON public.privy_transactions(wallet_id);
CREATE INDEX idx_privy_transactions_created_at ON public.privy_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.privy_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.privy_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all transactions (for edge function upserts)
CREATE POLICY "Service can manage transactions"
  ON public.privy_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);