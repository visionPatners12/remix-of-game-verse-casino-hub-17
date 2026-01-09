-- Add denormalized columns to category_subcategories to avoid raw_data parsing
ALTER TABLE polymarket.category_subcategories 
ADD COLUMN IF NOT EXISTS label TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Migrate existing data from raw_data
UPDATE polymarket.category_subcategories 
SET 
  label = raw_data->'child'->>'label',
  slug = raw_data->'child'->>'slug'
WHERE label IS NULL OR slug IS NULL;