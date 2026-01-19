-- Complete coordinates update for ALL Viroqua businesses
-- Based on actual addresses provided

UPDATE locations SET 
  latitude = CASE slug
    -- My Wild Child - 210 S Main St
    WHEN 'my-wild-child' THEN 43.556650
    
    -- The Commons - 401 E Jefferson St  
    WHEN 'the-commons' THEN 43.555900
    
    -- McIntosh Memorial Library - 205 S Rock Ave
    WHEN 'mcintosh-memorial-library' THEN 43.555058
    
    -- Ewetopia - 102 S Main St
    WHEN 'ewetopia' THEN 43.557400
    
    -- Woolly Bear Taphouse - 117 E Terhune St
    WHEN 'woolly-bear-taphouse' THEN 43.555800
    
    -- Tractor Supply - 1202 N Main St
    WHEN 'tractor-supply' THEN 43.565200
    
    -- Kwik Trip South - 603 S Main St
    WHEN 'kwik-trip-south' THEN 43.552800
    
    -- Kwik Trip North - 1301 N Main St
    WHEN 'kwik-trip-north' THEN 43.566100
    
    -- Maybe Lately's - 117 N Main St
    WHEN 'maybe-latelys' THEN 43.558200
    
    -- Driftless Cafe - 118 W Court St
    WHEN 'driftless-cafe' THEN 43.556700
    
    -- Driftless Books - 108 S Main St
    WHEN 'driftless-books' THEN 43.557350
    
    -- Noble Rind - 105 S Main St
    WHEN 'noble-rind' THEN 43.557375
    
    -- Nelson's AgriCenter - 126 N Main St
    WHEN 'nelsons-agricenter' THEN 43.558300
    
    -- Viroqua Food Co-op - 609 Main St (North Main)
    WHEN 'viroqua-coop' THEN 43.560529
    
    -- County Seat Laundry - 124 S Main St
    WHEN 'county-seat-laundry' THEN 43.557200
    
    ELSE latitude
  END,
  longitude = CASE slug
    -- My Wild Child
    WHEN 'my-wild-child' THEN -90.888550
    
    -- The Commons
    WHEN 'the-commons' THEN -90.886800
    
    -- McIntosh Memorial Library
    WHEN 'mcintosh-memorial-library' THEN -90.890274
    
    -- Ewetopia
    WHEN 'ewetopia' THEN -90.888450
    
    -- Woolly Bear Taphouse
    WHEN 'woolly-bear-taphouse' THEN -90.887300
    
    -- Tractor Supply
    WHEN 'tractor-supply' THEN -90.887500
    
    -- Kwik Trip South
    WHEN 'kwik-trip-south' THEN -90.888900
    
    -- Kwik Trip North
    WHEN 'kwik-trip-north' THEN -90.887200
    
    -- Maybe Lately's
    WHEN 'maybe-latelys' THEN -90.888400
    
    -- Driftless Cafe
    WHEN 'driftless-cafe' THEN -90.889200
    
    -- Driftless Books
    WHEN 'driftless-books' THEN -90.888460
    
    -- Noble Rind
    WHEN 'noble-rind' THEN -90.888455
    
    -- Nelson's AgriCenter
    WHEN 'nelsons-agricenter' THEN -90.888380
    
    -- Viroqua Food Co-op
    WHEN 'viroqua-coop' THEN -90.888879
    
    -- County Seat Laundry
    WHEN 'county-seat-laundry' THEN -90.888480
    
    ELSE longitude
  END
WHERE town = 'viroqua';

-- Verify the update
SELECT name, slug, address, latitude, longitude 
FROM locations 
WHERE town = 'viroqua'
ORDER BY name;