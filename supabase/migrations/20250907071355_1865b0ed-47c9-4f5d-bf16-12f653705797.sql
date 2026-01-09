-- First, let's clean up any duplicate users and improve the user search logic

-- Delete duplicate users without privy_user_id but keep the original ones
DELETE FROM public.users 
WHERE id IN (
  SELECT u1.id 
  FROM public.users u1
  INNER JOIN public.users u2 ON u1.email = u2.email 
  WHERE u1.privy_user_id IS NULL 
  AND u2.privy_user_id IS NOT NULL
  AND u1.created_at > u2.created_at
);

-- Add unique constraints to prevent future duplicates
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_wallet_address_unique 
ON public.users (wallet_address) 
WHERE wallet_address IS NOT NULL AND auth_method = 'wallet';

-- Add partial unique index for email users
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique 
ON public.users (email) 
WHERE email IS NOT NULL AND auth_method = 'email';