-- Complete fix for The Drift admin panel database functions and permissions
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- 1. First, check and enable RLS on tables
-- ============================================
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE towns ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Drop all existing policies to start fresh
-- ============================================
DROP POLICY IF EXISTS "Enable read access for all users" ON locations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON locations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON locations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON locations;

DROP POLICY IF EXISTS "Enable read access for all users" ON photos;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON photos;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON photos;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON photos;

DROP POLICY IF EXISTS "Enable read access for all users" ON towns;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON towns;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON towns;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON towns;

-- ============================================
-- 3. Create comprehensive RLS policies
-- ============================================

-- Locations table policies
CREATE POLICY "Enable read access for all users" 
ON locations FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON locations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON locations FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
ON locations FOR DELETE 
TO authenticated 
USING (true);

-- Photos table policies
CREATE POLICY "Enable read access for all users" 
ON photos FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON photos FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON photos FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
ON photos FOR DELETE 
TO authenticated 
USING (true);

-- Towns table policies
CREATE POLICY "Enable read access for all users" 
ON towns FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON towns FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON towns FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
ON towns FOR DELETE 
TO authenticated 
USING (true);

-- ============================================
-- 4. Drop ALL versions of existing admin functions
-- ============================================

-- First, find and drop all versions of admin_create_location
DO $$ 
DECLARE
    _sql text;
BEGIN
    FOR _sql IN 
        SELECT 'DROP FUNCTION IF EXISTS ' || oid::regprocedure || ' CASCADE;' 
        FROM pg_proc 
        WHERE proname = 'admin_create_location'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE _sql;
    END LOOP;
END $$;

-- Drop all versions of admin_update_location
DO $$ 
DECLARE
    _sql text;
BEGIN
    FOR _sql IN 
        SELECT 'DROP FUNCTION IF EXISTS ' || oid::regprocedure || ' CASCADE;' 
        FROM pg_proc 
        WHERE proname = 'admin_update_location'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE _sql;
    END LOOP;
END $$;

-- Drop all versions of admin_toggle_location_active
DO $$ 
DECLARE
    _sql text;
BEGIN
    FOR _sql IN 
        SELECT 'DROP FUNCTION IF EXISTS ' || oid::regprocedure || ' CASCADE;' 
        FROM pg_proc 
        WHERE proname = 'admin_toggle_location_active'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE _sql;
    END LOOP;
END $$;

-- Drop all versions of admin_remove_location
DO $$ 
DECLARE
    _sql text;
BEGIN
    FOR _sql IN 
        SELECT 'DROP FUNCTION IF EXISTS ' || oid::regprocedure || ' CASCADE;' 
        FROM pg_proc 
        WHERE proname = 'admin_remove_location'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE _sql;
    END LOOP;
END $$;

-- ============================================
-- 5. Create new admin functions with proper parameters
-- ============================================

-- Function to toggle location active status (simplest, create first)
CREATE OR REPLACE FUNCTION admin_toggle_location_active(
  p_id uuid,
  p_is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE locations 
  SET 
    is_active = p_is_active,
    updated_at = NOW()
  WHERE id = p_id;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Location with ID % not found', p_id;
  END IF;
END;
$$;

-- Function to remove a location and its photos
CREATE OR REPLACE FUNCTION admin_remove_location(
  p_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  photo_count integer;
  location_name text;
BEGIN
  -- Get location name for logging
  SELECT name INTO location_name FROM locations WHERE id = p_id;
  
  IF location_name IS NULL THEN
    RAISE NOTICE 'Location with ID % not found', p_id;
    RETURN;
  END IF;
  
  -- Count photos to be deleted
  SELECT COUNT(*) INTO photo_count FROM photos WHERE location_id = p_id;
  
  -- Delete all photos for this location
  DELETE FROM photos WHERE location_id = p_id;
  
  -- Delete the location
  DELETE FROM locations WHERE id = p_id;
  
  -- Log the action
  RAISE NOTICE 'Deleted location "%" (ID: %) and % associated photos', location_name, p_id, photo_count;
END;
$$;

-- Function to update an existing location (simplified version matching current usage)
CREATE OR REPLACE FUNCTION admin_update_location(
  p_id uuid,
  p_name text,
  p_slug text,
  p_town text,
  p_address text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE locations 
  SET 
    name = p_name,
    slug = p_slug,
    town = p_town,
    address = p_address,
    description = p_description,
    updated_at = NOW()
  WHERE id = p_id;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Location with ID % not found', p_id;
  END IF;
END;
$$;

-- ============================================
-- 6. Grant proper permissions
-- ============================================

-- Grant execute permissions to authenticated users (for admin panel)
GRANT EXECUTE ON FUNCTION admin_toggle_location_active(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_remove_location(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_location(uuid, text, text, text, text, text) TO authenticated;

-- Also grant to anon for backward compatibility
GRANT EXECUTE ON FUNCTION admin_toggle_location_active(uuid, boolean) TO anon;
GRANT EXECUTE ON FUNCTION admin_remove_location(uuid) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_location(uuid, text, text, text, text, text) TO anon;

-- ============================================
-- 7. Grant table permissions
-- ============================================

-- Grant necessary permissions to authenticated role
GRANT ALL ON locations TO authenticated;
GRANT ALL ON photos TO authenticated;
GRANT ALL ON towns TO authenticated;

-- Grant read permissions to anon role
GRANT SELECT ON locations TO anon;
GRANT SELECT ON photos TO anon;
GRANT SELECT ON towns TO anon;

-- ============================================
-- 8. Verify everything is set up correctly
-- ============================================

-- Check that functions exist
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments
FROM pg_proc 
WHERE proname IN ('admin_toggle_location_active', 'admin_remove_location', 'admin_update_location')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Check RLS is enabled
SELECT 
    tablename, 
    rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('locations', 'photos', 'towns');

-- Check policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd AS operation,
    roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('locations', 'photos', 'towns')
ORDER BY tablename, policyname;