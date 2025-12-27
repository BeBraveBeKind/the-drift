-- Fix location issues in Supabase
-- Run this AFTER running add-all-locations.sql if Noble Rind is still missing

-- 1. Remove any Magpie's/Magie's entries (these were typos)
DELETE FROM locations WHERE slug IN ('magpies', 'magies');

-- 2. Ensure Noble Rind exists (force insert if missing)
INSERT INTO locations (name, slug, address, description, is_active) 
VALUES ('Noble Rind', 'noble-rind', '105 S Main St', 'Board near entrance', true)
ON CONFLICT (slug) 
DO UPDATE SET 
    name = 'Noble Rind',
    address = '105 S Main St', 
    description = 'Board near entrance',
    is_active = true;

-- 3. Verify Noble Rind is now there and active
SELECT * FROM locations WHERE slug = 'noble-rind';

-- 4. Show all active locations
SELECT name, slug, address, is_active FROM locations WHERE is_active = true ORDER BY name;