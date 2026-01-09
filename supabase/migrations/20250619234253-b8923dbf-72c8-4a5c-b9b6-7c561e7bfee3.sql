
-- Fix: Add missing is_active column to store_items table
-- This column is referenced in the code but missing from the table

ALTER TABLE public.store_items 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Update existing records to be active by default
UPDATE public.store_items 
SET is_active = true 
WHERE is_active IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.store_items.is_active IS 'Indicates if the store item is currently available for purchase';
