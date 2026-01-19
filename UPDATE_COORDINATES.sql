-- Update coordinates for Viroqua locations
-- Get accurate coordinates from Google Maps:
-- 1. Search for the business
-- 2. Right-click on location → "What's here?"
-- 3. Click coordinates to copy

UPDATE locations SET 
  latitude = CASE slug
    -- McIntosh Memorial Library (example: 217 S Main St, Viroqua, WI)
    WHEN 'mcintosh-memorial-library' THEN NULL  -- Replace NULL with actual latitude
    
    -- Viroqua Food Co-op (609 S Main St, Viroqua, WI)
    WHEN 'viroqua-coop' THEN NULL  -- Replace NULL with actual latitude
    
    -- Driftless Cafe (118 Court St, Viroqua, WI)
    WHEN 'driftless-cafe' THEN NULL  -- Replace NULL with actual latitude
    
    -- Ewetopia (fiber arts shop)
    WHEN 'ewetopia' THEN NULL  -- Replace NULL with actual latitude
    
    -- Kwik Trip North (N Main St)
    WHEN 'kwik-trip-north' THEN NULL  -- Replace NULL with actual latitude
    
    -- Kwik Trip South (Nelson Pkwy)
    WHEN 'kwik-trip-south' THEN NULL  -- Replace NULL with actual latitude
    
    -- County Seat Laundry
    WHEN 'county-seat-laundry' THEN NULL  -- Replace NULL with actual latitude
    
    ELSE latitude
  END,
  longitude = CASE slug
    WHEN 'mcintosh-memorial-library' THEN NULL  -- Replace NULL with actual longitude
    WHEN 'viroqua-coop' THEN NULL  -- Replace NULL with actual longitude
    WHEN 'driftless-cafe' THEN NULL  -- Replace NULL with actual longitude
    WHEN 'ewetopia' THEN NULL  -- Replace NULL with actual longitude
    WHEN 'kwik-trip-north' THEN NULL  -- Replace NULL with actual longitude
    WHEN 'kwik-trip-south' THEN NULL  -- Replace NULL with actual longitude
    WHEN 'county-seat-laundry' THEN NULL  -- Replace NULL with actual longitude
    ELSE longitude
  END
WHERE town = 'viroqua';

-- Alternatively, update individual locations as you get coordinates:
-- UPDATE locations SET latitude = 43.XXXXX, longitude = -90.XXXXX WHERE slug = 'mcintosh-memorial-library';