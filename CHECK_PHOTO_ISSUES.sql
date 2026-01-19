-- Check for HEIC photos and photo issues in the database

-- 1. Find all HEIC photos
SELECT 
  p.id as photo_id,
  p.storage_path,
  p.created_at,
  p.is_current,
  l.name as location_name,
  l.slug as location_slug
FROM photos p
JOIN locations l ON p.location_id = l.id
WHERE LOWER(p.storage_path) LIKE '%.heic'
ORDER BY l.name;

-- 2. Check locations without any current photos
SELECT 
  l.name,
  l.slug,
  l.view_count,
  COUNT(p.id) as total_photos,
  SUM(CASE WHEN p.is_current = true THEN 1 ELSE 0 END) as current_photos
FROM locations l
LEFT JOIN photos p ON l.id = p.location_id
WHERE l.is_active = true
  AND l.town = 'viroqua'
GROUP BY l.id, l.name, l.slug, l.view_count
HAVING SUM(CASE WHEN p.is_current = true THEN 1 ELSE 0 END) = 0
ORDER BY l.view_count DESC;

-- 3. See all current photos with their formats
SELECT 
  l.name as location_name,
  l.slug,
  p.storage_path,
  LOWER(SUBSTRING(p.storage_path FROM '\.([^.]+)$')) as file_extension,
  p.created_at
FROM locations l
LEFT JOIN photos p ON l.id = p.location_id AND p.is_current = true
WHERE l.is_active = true
  AND l.town = 'viroqua'
ORDER BY l.name;