-- Migration: Rename market/outcome to marketType/pick in social_post.selections
-- This aligns the database schema with the frontend TypeScript naming convention

-- Rename columns
ALTER TABLE social_post.selections 
  RENAME COLUMN market TO market_type;

ALTER TABLE social_post.selections 
  RENAME COLUMN outcome TO pick;

-- Add documentation comments
COMMENT ON COLUMN social_post.selections.market_type IS 'Type of betting market (e.g., "Match Result", "Total Points")';
COMMENT ON COLUMN social_post.selections.pick IS 'User selection/pick (e.g., "Team A Win", "Over 2.5")';