-- Migration: Add town column to locations table for Switchboard
-- Date: 2025-01-03
-- Purpose: Support multi-town functionality for switchboard.town

-- Add town column with default for existing locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS town text DEFAULT 'viroqua';

-- Create index for town queries
CREATE INDEX IF NOT EXISTS idx_locations_town ON locations(town);

-- Verify migration
SELECT 
  COUNT(*) as total_locations,
  COUNT(DISTINCT town) as unique_towns,
  town,
  COUNT(*) as count_per_town
FROM locations
GROUP BY town
ORDER BY count_per_town DESC;

-- Optional: Create RPC function for town-filtered location fetch
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_locations_by_town(text) TO anon;

-- Success message
SELECT 'Town column migration complete!' as status;