-- Add unique constraints to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wallet_address_unique 
ON public.users (wallet_address) 
WHERE wallet_address IS NOT NULL AND auth_method = 'wallet';

-- Add partial unique index for email users  
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique 
ON public.users (email) 
WHERE email IS NOT NULL AND auth_method = 'email';