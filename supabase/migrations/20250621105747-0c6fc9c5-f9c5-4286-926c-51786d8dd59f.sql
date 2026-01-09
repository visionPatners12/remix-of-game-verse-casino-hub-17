
-- Ajouter les colonnes nécessaires pour les adresses de dépôt crypto
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS deposit_address text,
ADD COLUMN IF NOT EXISTS next_addr_index integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_id text;

-- Ajouter un index pour optimiser les recherches par adresse de dépôt
CREATE INDEX IF NOT EXISTS idx_users_deposit_address ON public.users(deposit_address);
