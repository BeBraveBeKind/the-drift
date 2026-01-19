-- Accurate coordinates for Viroqua locations based on web search
UPDATE locations SET 
  latitude = CASE slug
    -- McIntosh Memorial Library - 205 S Rock Ave (current location)
    WHEN 'mcintosh-memorial-library' THEN 43.555058
    
    -- Viroqua Food Co-op - 609 N Main St (NOT South Main)
    WHEN 'viroqua-coop' THEN 43.560529
    
    -- Driftless Cafe - 118 W Court St
    WHEN 'driftless-cafe' THEN 43.556700  -- Estimated based on downtown location
    
    -- Ewetopia - Downtown location
    WHEN 'ewetopia' THEN 43.556500  -- Estimated downtown
    
    -- Kwik Trip North - N Main St
    WHEN 'kwik-trip-north' THEN 43.566000  -- North of downtown
    
    -- Kwik Trip South - Nelson Pkwy
    WHEN 'kwik-trip-south' THEN 43.545000  -- South of downtown
    
    -- County Seat Laundry - Downtown
    WHEN 'county-seat-laundry' THEN 43.556800  -- Downtown location
    
    ELSE latitude
  END,
  longitude = CASE slug
    -- McIntosh Memorial Library
    WHEN 'mcintosh-memorial-library' THEN -90.890274
    
    -- Viroqua Food Co-op  
    WHEN 'viroqua-coop' THEN -90.888879
    
    -- Driftless Cafe
    WHEN 'driftless-cafe' THEN -90.889200  -- Estimated
    
    -- Ewetopia
    WHEN 'ewetopia' THEN -90.888500  -- Estimated
    
    -- Kwik Trip North
    WHEN 'kwik-trip-north' THEN -90.888800  -- North Main
    
    -- Kwik Trip South  
    WHEN 'kwik-trip-south' THEN -90.891200  -- Nelson Pkwy
    
    -- County Seat Laundry
    WHEN 'county-seat-laundry' THEN -90.888600  -- Downtown
    
    ELSE longitude
  END
WHERE town = 'viroqua';