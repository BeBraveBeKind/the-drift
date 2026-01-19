-- Migration: Fix slug uniqueness constraint
-- Purpose: Allow identical board names across different towns
-- Date: 2024-01-19

-- Drop existing unique constraint on slug
ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_slug_key;

-- Add composite unique constraint (slug must be unique within a town)
ALTER TABLE locations ADD CONSTRAINT locations_slug_town_unique UNIQUE(slug, town_id);

-- Verify the constraint exists
SELECT constraint_name, constraint_type 
FROM information_schema.constraints 
WHERE table_name = 'locations' AND constraint_name = 'locations_slug_town_unique';