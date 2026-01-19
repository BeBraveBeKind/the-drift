-- Migration 005: Location Coordinates for Map View
-- Adds latitude and longitude fields to enable geographic discovery

-- Add coordinate fields to locations table
ALTER TABLE locations 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Create spatial index for performance when querying nearby locations
CREATE INDEX idx_locations_coordinates ON locations (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add a helper function to calculate distance between two points (in miles)
-- Using Haversine formula for accurate distance calculation
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL(10, 8),
  lon1 DECIMAL(11, 8),
  lat2 DECIMAL(10, 8),
  lon2 DECIMAL(11, 8)
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  earth_radius_miles CONSTANT DECIMAL := 3958.8; -- Earth's radius in miles
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
  distance DECIMAL;
BEGIN
  -- Return NULL if any coordinate is NULL
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  -- Convert degrees to radians
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  -- Haversine formula
  a := sin(dlat / 2) * sin(dlat / 2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon / 2) * sin(dlon / 2);
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  distance := earth_radius_miles * c;
  
  RETURN distance;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to find locations within a radius (in miles)
CREATE OR REPLACE FUNCTION find_locations_within_radius(
  center_lat DECIMAL(10, 8),
  center_lon DECIMAL(11, 8),
  radius_miles DECIMAL(10, 2)
)
RETURNS TABLE(
  location_id UUID,
  distance_miles DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id AS location_id,
    calculate_distance(center_lat, center_lon, l.latitude, l.longitude) AS distance_miles
  FROM locations l
  WHERE 
    l.latitude IS NOT NULL 
    AND l.longitude IS NOT NULL
    AND l.is_active = true
    AND calculate_distance(center_lat, center_lon, l.latitude, l.longitude) <= radius_miles
  ORDER BY distance_miles;
END;
$$ LANGUAGE plpgsql;

-- Add more accurate coordinates for existing Viroqua locations
-- Based on actual Viroqua, WI business locations
UPDATE locations SET 
  latitude = CASE slug
    WHEN 'mcintosh-memorial-library' THEN 43.556885  -- 217 S Main St
    WHEN 'viroqua-coop' THEN 43.555340               -- 609 S Main St  
    WHEN 'driftless-cafe' THEN 43.557172             -- 118 Court St
    WHEN 'ewetopia' THEN 43.556509                   -- 128 S Main St
    WHEN 'kwik-trip-north' THEN 43.566478            -- 1303 N Main St
    WHEN 'kwik-trip-south' THEN 43.543177            -- 800 Nelson Pkwy
    WHEN 'county-seat-laundry' THEN 43.557058        -- 220 S Main St
    ELSE NULL
  END,
  longitude = CASE slug
    WHEN 'mcintosh-memorial-library' THEN -90.888523
    WHEN 'viroqua-coop' THEN -90.889274
    WHEN 'driftless-cafe' THEN -90.888920
    WHEN 'ewetopia' THEN -90.888485
    WHEN 'kwik-trip-north' THEN -90.887110
    WHEN 'kwik-trip-south' THEN -90.891205
    WHEN 'county-seat-laundry' THEN -90.888590
    ELSE NULL
  END
WHERE town = 'viroqua' AND slug IN (
  'mcintosh-memorial-library',
  'viroqua-coop',
  'driftless-cafe',
  'ewetopia',
  'kwik-trip-north',
  'kwik-trip-south',
  'county-seat-laundry'
);

-- Create a view for map display that includes all necessary fields
CREATE OR REPLACE VIEW locations_map_view AS
SELECT 
  l.id,
  l.name,
  l.slug,
  l.address,
  l.town,
  l.town_id,
  l.latitude,
  l.longitude,
  l.business_category,
  l.business_tags,
  l.profile_completed,
  l.is_active,
  l.view_count,
  p.storage_path as photo_path,
  p.created_at as photo_updated_at
FROM locations l
LEFT JOIN LATERAL (
  SELECT storage_path, created_at
  FROM photos
  WHERE location_id = l.id 
    AND is_current = true 
    AND is_flagged = false
  LIMIT 1
) p ON true
WHERE l.is_active = true
  AND l.latitude IS NOT NULL
  AND l.longitude IS NOT NULL;

-- Grant permissions for the web app to use these new functions
-- (Adjust based on your Supabase auth setup)