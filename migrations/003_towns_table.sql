-- Migration: Create towns table and dynamic town management
-- Purpose: Enable data-driven town management without hardcoding
-- Date: 2024-01-19

-- Create towns table
CREATE TABLE towns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX idx_towns_slug ON towns(slug);
CREATE INDEX idx_towns_is_active ON towns(is_active);

-- Add foreign key to locations table if town_id doesn't exist
DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'locations' AND column_name = 'town_id') THEN
    ALTER TABLE locations
      ADD COLUMN town_id uuid REFERENCES towns(id) ON DELETE RESTRICT;
  END IF;
END $;

-- Seed with existing town
INSERT INTO towns (name, slug, description) 
VALUES ('Viroqua', 'viroqua', 'Viroqua, Wisconsin community board')
ON CONFLICT (slug) DO NOTHING;

-- Backfill existing locations with Viroqua town_id
UPDATE locations 
SET town_id = (SELECT id FROM towns WHERE slug = 'viroqua')
WHERE town_id IS NULL;

-- Make town_id NOT NULL after backfill (only if it exists and has been filled)
DO $ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'locations' AND column_name = 'town_id') THEN
    ALTER TABLE locations
      ALTER COLUMN town_id SET NOT NULL;
  END IF;
END $;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_towns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER towns_updated_at_trigger
BEFORE UPDATE ON towns
FOR EACH ROW
EXECUTE FUNCTION update_towns_updated_at();