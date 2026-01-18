-- Add safe_address column to store the Smart Account (Safe) address from Azuro SDK
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS safe_address text;

-- Add comment for documentation
COMMENT ON COLUMN public.users.safe_address IS 'Smart Account (Safe) address from Azuro SDK - used for deposits, withdrawals, and ENS';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_safe_address ON public.users(safe_address) WHERE safe_address IS NOT NULL;