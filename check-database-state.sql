-- Database State Diagnostic
-- Run this to check the current state of towns and locations

-- 1. Show all towns
SELECT 
    id,
    name,
    slug,
    is_active,
    created_at,
    updated_at
FROM towns
ORDER BY name;

-- 2. Count locations by town
SELECT 
    t.name as town_name,
    t.slug as town_slug,
    t.is_active as town_active,
    COUNT(l.id) as location_count,
    SUM(CASE WHEN l.is_active THEN 1 ELSE 0 END) as active_locations
FROM towns t
LEFT JOIN locations l ON l.town_id = t.id
GROUP BY t.id, t.name, t.slug, t.is_active
ORDER BY t.name;

-- 3. Show locations with missing or mismatched town data
SELECT 
    l.id,
    l.name,
    l.slug,
    l.town as town_field,
    l.town_id,
    t.slug as town_slug_from_id,
    t.name as town_name_from_id,
    l.is_active
FROM locations l
LEFT JOIN towns t ON l.town_id = t.id
WHERE 
    l.town_id IS NULL 
    OR l.town IS NULL 
    OR l.town != t.slug
ORDER BY l.name;

-- 4. Show locations without photos
SELECT 
    l.id,
    l.name,
    l.slug,
    l.town,
    t.name as town_name,
    l.is_active,
    COUNT(p.id) as photo_count
FROM locations l
LEFT JOIN towns t ON l.town_id = t.id
LEFT JOIN photos p ON p.location_id = l.id
GROUP BY l.id, l.name, l.slug, l.town, t.name, l.is_active
HAVING COUNT(p.id) = 0
ORDER BY l.name;

-- 5. Summary statistics
SELECT 
    (SELECT COUNT(*) FROM towns WHERE is_active = true) as active_towns,
    (SELECT COUNT(*) FROM locations WHERE is_active = true) as active_locations,
    (SELECT COUNT(*) FROM photos) as total_photos,
    (SELECT COUNT(DISTINCT location_id) FROM photos) as locations_with_photos;