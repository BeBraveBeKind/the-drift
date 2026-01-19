-- Fix Tractor Supply Location Issues
-- Run this in Supabase SQL Editor

-- 1. First, let's see the current state of Tractor Supply
SELECT 
  id,
  name, 
  slug, 
  town,
  address, 
  is_active,
  created_at,
  updated_at
FROM locations 
WHERE slug = 'tractor-supply';

-- 2. Fix the common issues:

-- A. Make sure it's active
UPDATE locations 
SET 
  is_active = true,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tractor-supply';

-- B. Make sure it has the town field set
UPDATE locations 
SET 
  town = 'viroqua',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tractor-supply' AND (town IS NULL OR town = '');

-- C. Make sure it has required fields
UPDATE locations 
SET 
  address = COALESCE(address, 'Address TBD'),
  description = COALESCE(description, 'Board location TBD'),
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tractor-supply';

-- 3. Verify the fix
SELECT 
  name, 
  slug, 
  town, 
  address,
  description,
  is_active,
  created_at,
  updated_at
FROM locations 
WHERE slug = 'tractor-supply';

-- 4. Show all active locations to confirm it appears
SELECT 
  name, 
  slug, 
  town, 
  address,
  is_active
FROM locations 
WHERE is_active = true
ORDER BY town, name;

-- Success message
SELECT 'Tractor Supply should now be visible in admin panel!' as status;