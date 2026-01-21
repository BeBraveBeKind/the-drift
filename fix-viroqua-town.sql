-- Fix Viroqua Town in Database
-- Run this in Supabase SQL Editor to ensure Viroqua exists and is active

-- 1. Check if Viroqua exists
SELECT * FROM towns WHERE slug = 'viroqua';

-- 2. If Viroqua doesn't exist, create it
INSERT INTO towns (name, slug, is_active, created_at, updated_at)
VALUES ('Viroqua', 'viroqua', true, NOW(), NOW())
ON CONFLICT (slug) 
DO UPDATE SET 
    is_active = true,
    updated_at = NOW();

-- 3. Verify Viroqua is now active
SELECT id, name, slug, is_active FROM towns WHERE slug = 'viroqua';

-- 4. Check all locations in Viroqua have the correct town_id
UPDATE locations 
SET town_id = (SELECT id FROM towns WHERE slug = 'viroqua')
WHERE town = 'viroqua' AND town_id IS NULL;

-- 5. Ensure all locations have both town and town_id set
UPDATE locations 
SET town = 'viroqua'
WHERE town_id = (SELECT id FROM towns WHERE slug = 'viroqua') 
  AND (town IS NULL OR town = '');

-- 6. Final verification - show Viroqua locations
SELECT 
    l.id,
    l.name,
    l.slug,
    l.town,
    l.town_id,
    t.name as town_name,
    l.is_active
FROM locations l
LEFT JOIN towns t ON l.town_id = t.id
WHERE l.town = 'viroqua' OR t.slug = 'viroqua'
ORDER BY l.name;

-- 7. Show summary
SELECT 
    'Viroqua Town Status' as info,
    COUNT(DISTINCT t.id) as towns_count,
    COUNT(DISTINCT l.id) as locations_count,
    SUM(CASE WHEN l.is_active THEN 1 ELSE 0 END) as active_locations
FROM towns t
LEFT JOIN locations l ON l.town_id = t.id
WHERE t.slug = 'viroqua';