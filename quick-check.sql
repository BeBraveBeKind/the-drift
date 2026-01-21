-- Quick Database Check
-- Run each query separately to see results

-- 1. Check if Viroqua exists
SELECT * FROM towns WHERE slug = 'viroqua';

-- 2. If no results above, create Viroqua
INSERT INTO towns (name, slug, is_active)
VALUES ('Viroqua', 'viroqua', true)
ON CONFLICT (slug) 
DO UPDATE SET 
    is_active = true,
    updated_at = NOW();

-- 3. Verify Viroqua now exists and get its ID
SELECT id, name, slug, is_active 
FROM towns 
WHERE slug = 'viroqua';

-- 4. Fix all locations that have town='viroqua' but missing town_id
UPDATE locations 
SET town_id = (SELECT id FROM towns WHERE slug = 'viroqua' LIMIT 1)
WHERE town = 'viroqua' AND town_id IS NULL;

-- 5. Count Viroqua locations
SELECT COUNT(*) as viroqua_locations
FROM locations 
WHERE town = 'viroqua' OR town_id = (SELECT id FROM towns WHERE slug = 'viroqua' LIMIT 1);

-- 6. Show first 5 Viroqua locations
SELECT name, slug, is_active, town, town_id
FROM locations 
WHERE town = 'viroqua' OR town_id = (SELECT id FROM towns WHERE slug = 'viroqua' LIMIT 1)
LIMIT 5;