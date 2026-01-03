-- Complete Switchboard Migration
-- Run this entire script in Supabase SQL Editor to update your database

-- 1. Add town column to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS town text DEFAULT 'viroqua';

-- 2. Create index for town queries
CREATE INDEX IF NOT EXISTS idx_locations_town ON locations(town);

-- 3. Update all existing locations to have town = 'viroqua'
UPDATE locations 
SET town = 'viroqua' 
WHERE town IS NULL OR town = '';

-- 4. Update the admin_create_location function
CREATE OR REPLACE FUNCTION admin_create_location(
  p_name text,
  p_slug text,
  p_town text DEFAULT 'viroqua',
  p_address text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO locations (name, slug, town, address, description, is_active)
  VALUES (p_name, p_slug, p_town, p_address, p_description, true);
END;
$$;

-- 5. Update the admin_update_location function
CREATE OR REPLACE FUNCTION admin_update_location(
  p_id uuid,
  p_name text,
  p_slug text,
  p_town text DEFAULT 'viroqua',
  p_address text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE locations
  SET 
    name = p_name,
    slug = p_slug,
    town = p_town,
    address = p_address,
    description = p_description,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_id;
END;
$$;

-- 6. Create town-filtered location fetch function
CREATE OR REPLACE FUNCTION get_locations_by_town(p_town text)
RETURNS SETOF locations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM locations
  WHERE town = p_town AND is_active = true
  ORDER BY updated_at DESC;
END;
$$;

-- 7. Grant execute permissions to anon role
GRANT EXECUTE ON FUNCTION admin_create_location(text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_location(uuid, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION get_locations_by_town(text) TO anon;

-- 8. Also grant the old function signatures for backwards compatibility during transition
GRANT EXECUTE ON FUNCTION admin_create_location(text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_location(uuid, text, text, text, text) TO anon;

-- 9. Verification - show all locations with their towns
SELECT 
  name, 
  slug, 
  town, 
  address, 
  is_active,
  created_at
FROM locations 
ORDER BY town, name;

-- 10. Success message
SELECT 'Switchboard migration complete! Database updated with town support.' as status;