-- Debug Tractor Supply Location Issue
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check if Tractor Supply exists (any state)
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
WHERE 
  slug ILIKE '%tractor%' 
  OR name ILIKE '%tractor%' 
  OR slug = 'tractor-supply'
  OR name = 'Tractor Supply';

-- 2. Check all locations to see current state
SELECT 
  name, 
  slug, 
  town, 
  is_active,
  created_at
FROM locations 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check if there are any constraint violations
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'locations'::regclass;

-- 4. Try to manually insert Tractor Supply to see what error occurs
BEGIN;
  INSERT INTO locations (name, slug, town, address, description, is_active) 
  VALUES ('Tractor Supply', 'tractor-supply', 'viroqua', 'Enter address', 'Board location TBD', true);
ROLLBACK;  -- This will show the error without committing

-- 5. Check what admin functions exist
SELECT 
  routine_name,
  specific_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%admin%'
ORDER BY routine_name;

-- 6. If Tractor Supply exists but is inactive, reactivate it
UPDATE locations 
SET 
  is_active = true,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tractor-supply' AND is_active = false;

-- 7. Final verification - show all active locations
SELECT 
  name, 
  slug, 
  town, 
  address,
  is_active
FROM locations 
WHERE is_active = true
ORDER BY town, name;