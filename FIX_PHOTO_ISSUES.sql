-- Solutions for fixing photo issues

-- OPTION 1: Remove all HEIC photos from being current
-- (You'll need to upload new JPG/PNG photos through admin)
UPDATE photos 
SET is_current = false 
WHERE LOWER(storage_path) LIKE '%.heic'
  AND is_current = true;

-- OPTION 2: Delete HEIC photos entirely (CAREFUL - this is permanent!)
-- Uncomment to use:
-- DELETE FROM photos 
-- WHERE LOWER(storage_path) LIKE '%.heic';

-- OPTION 3: Mark specific problematic photos as not current
-- Replace 'photo-id-here' with actual photo IDs
-- UPDATE photos 
-- SET is_current = false 
-- WHERE id IN ('photo-id-1', 'photo-id-2', 'photo-id-3');

-- After fixing, verify which locations need new photos:
SELECT 
  l.name,
  l.slug,
  l.address,
  'https://switchboard.town/admin' as admin_url_to_upload
FROM locations l
LEFT JOIN photos p ON l.id = p.location_id AND p.is_current = true AND p.is_flagged = false
WHERE l.is_active = true
  AND l.town = 'viroqua'
  AND p.id IS NULL
ORDER BY l.view_count DESC;