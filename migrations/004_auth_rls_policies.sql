-- Migration: Set up RLS policies for authenticated admin operations
-- Purpose: Secure admin operations behind proper authentication
-- Date: 2024-01-19

-- Enable RLS on tables if not already enabled
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE towns ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read access to active locations" ON locations;
DROP POLICY IF EXISTS "Authenticated users can modify locations" ON locations;
DROP POLICY IF EXISTS "Public read access to active towns" ON towns;
DROP POLICY IF EXISTS "Authenticated users can modify towns" ON towns;
DROP POLICY IF EXISTS "Public read access to photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can modify photos" ON photos;

-- Locations policies
-- Allow public read for active locations
CREATE POLICY "Public read access to active locations"
  ON locations
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users (admins) to perform all operations
CREATE POLICY "Authenticated users can modify locations"
  ON locations
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Towns policies
-- Allow public read for active towns
CREATE POLICY "Public read access to active towns"
  ON towns
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users (admins) to perform all operations
CREATE POLICY "Authenticated users can modify towns"
  ON towns
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Photos policies
-- Allow public read for non-flagged photos
CREATE POLICY "Public read access to photos"
  ON photos
  FOR SELECT
  USING (is_flagged = false);

-- Allow authenticated users (admins) to perform all operations
CREATE POLICY "Authenticated users can modify photos"
  ON photos
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Note: To create admin users, go to Supabase dashboard > Authentication > Users
-- and create users with email/password authentication