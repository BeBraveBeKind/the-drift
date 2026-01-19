-- Combined Migration Script for Critical Foundations
-- Run this in Supabase SQL Editor to apply all changes
-- Date: 2024-01-19

-- =====================================================
-- PART 1: TOWNS TABLE
-- =====================================================

-- Create towns table if it doesn't exist
CREATE TABLE IF NOT EXISTS towns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_towns_slug ON towns(slug);
CREATE INDEX IF NOT EXISTS idx_towns_is_active ON towns(is_active);

-- Add town_id to locations table if it doesn't exist
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

-- Make town_id NOT NULL after backfill
DO $ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'locations' AND column_name = 'town_id' 
             AND is_nullable = 'YES') THEN
    -- Check if all locations have town_id filled
    IF NOT EXISTS (SELECT 1 FROM locations WHERE town_id IS NULL) THEN
      ALTER TABLE locations
        ALTER COLUMN town_id SET NOT NULL;
    END IF;
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

DROP TRIGGER IF EXISTS towns_updated_at_trigger ON towns;
CREATE TRIGGER towns_updated_at_trigger
BEFORE UPDATE ON towns
FOR EACH ROW
EXECUTE FUNCTION update_towns_updated_at();

-- =====================================================
-- PART 2: FIX SLUG UNIQUENESS CONSTRAINT
-- =====================================================

-- Drop existing unique constraint on slug
ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_slug_key;

-- Add composite unique constraint (slug must be unique within a town)
ALTER TABLE locations ADD CONSTRAINT locations_slug_town_unique UNIQUE(slug, town_id);

-- =====================================================
-- PART 3: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on tables if not already enabled
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE towns ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access to active locations" ON locations;
DROP POLICY IF EXISTS "Authenticated users can modify locations" ON locations;
DROP POLICY IF EXISTS "Public read access to active towns" ON towns;
DROP POLICY IF EXISTS "Authenticated users can modify towns" ON towns;
DROP POLICY IF EXISTS "Public read access to photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can modify photos" ON photos;

-- Locations policies
CREATE POLICY "Public read access to active locations"
  ON locations
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can modify locations"
  ON locations
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Towns policies
CREATE POLICY "Public read access to active towns"
  ON towns
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can modify towns"
  ON towns
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Photos policies
CREATE POLICY "Public read access to photos"
  ON photos
  FOR SELECT
  USING (is_flagged = false);

CREATE POLICY "Authenticated users can modify photos"
  ON photos
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify towns table exists and has data
SELECT 'Towns table created' AS status, COUNT(*) AS count FROM towns;

-- Verify locations have town_id
SELECT 'Locations with town_id' AS status, COUNT(*) AS count 
FROM locations WHERE town_id IS NOT NULL;

-- Verify unique constraint
SELECT 'Slug-Town unique constraint' AS status, 
       constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'locations' 
  AND constraint_name = 'locations_slug_town_unique';

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create admin user(s) with email and password
-- 3. Test login at /admin/login
-- 4. Add new towns via the admin interface