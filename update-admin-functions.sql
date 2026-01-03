-- Update admin functions to support town parameter
-- Date: 2025-01-03
-- Purpose: Update admin RPC functions to handle town field

-- Update the admin_create_location function
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

-- Update the admin_update_location function
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

-- Success message
SELECT 'Admin functions updated for town support!' as status;