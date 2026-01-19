-- Remove HEIC photo records that no longer exist in storage
-- These are causing broken images on the site

DELETE FROM photos 
WHERE LOWER(storage_path) LIKE '%.heic'
   OR LOWER(storage_path) LIKE '%.heif';

-- Verify cleanup
SELECT COUNT(*) as remaining_photos,
       COUNT(CASE WHEN LOWER(storage_path) LIKE '%.heic' OR LOWER(storage_path) LIKE '%.heif' THEN 1 END) as heic_photos,
       COUNT(CASE WHEN LOWER(storage_path) LIKE '%.jpg' OR LOWER(storage_path) LIKE '%.jpeg' THEN 1 END) as jpeg_photos
FROM photos;

-- Check which locations need new photos
SELECT 
  l.name,
  l.slug,
  l.town,
  COUNT(p.id) as photo_count
FROM locations l
LEFT JOIN photos p ON l.id = p.location_id
WHERE l.is_active = true
GROUP BY l.id, l.name, l.slug, l.town
HAVING COUNT(p.id) = 0
ORDER BY l.town, l.name;