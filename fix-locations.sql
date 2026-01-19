-- Fix location issues in Switchboard
-- Run this AFTER running migration-add-town.sql and update-admin-functions.sql

-- 1. Remove any Magpie's/Magie's entries (these were typos)
DELETE FROM locations WHERE slug IN ('magpies', 'magies');

-- 2. Ensure all existing locations have town set to 'viroqua' (migration default)
UPDATE locations 
SET town = 'viroqua' 
WHERE town IS NULL OR town = '';

-- 3. Ensure Noble Rind exists with town (force insert if missing)
INSERT INTO locations (name, slug, town, address, description, is_active) 
VALUES ('Noble Rind', 'noble-rind', 'viroqua', '105 S Main St', 'Board near entrance', true)
ON CONFLICT (slug) 
DO UPDATE SET 
    name = 'Noble Rind',
    town = 'viroqua',
    address = '105 S Main St', 
    description = 'Board near entrance',
    is_active = true;

-- 4. Verify Noble Rind is now there and active
SELECT * FROM locations WHERE slug = 'noble-rind' AND town = 'viroqua';

-- 5. Show all active locations with their towns
SELECT name, slug, town, address, is_active FROM locations WHERE is_active = true ORDER BY town, name;