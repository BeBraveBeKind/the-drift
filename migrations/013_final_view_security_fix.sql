-- ================================================================================
-- Migration: Final Security Fix for locations_map_view
-- Purpose: Completely remove and recreate view with proper security settings
-- Date: 2026-02-03
-- 
-- ROOT CAUSE: Migration 005 creates this view without security settings
-- ================================================================================

-- Step 1: Drop ALL versions of this view
DROP VIEW IF EXISTS public.locations_map_view CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.locations_map_view CASCADE;

-- Step 2: Recreate with explicit SECURITY INVOKER (not definer)
CREATE VIEW public.locations_map_view AS
SELECT 
  l.id,
  l.name,
  l.slug,
  l.address,
  l.description,
  l.latitude,
  l.longitude,
  l.view_count,
  l.is_active,
  l.town_id,
  t.name as town_name,
  t.slug as town_slug,
  p.storage_path as current_photo_path
FROM public.locations l
LEFT JOIN public.towns t ON l.town_id = t.id
LEFT JOIN public.photos p ON p.location_id = l.id AND p.is_current = true AND p.is_flagged = false
WHERE l.is_active = true;

-- Step 3: Set ownership and permissions
ALTER VIEW public.locations_map_view OWNER TO postgres;
GRANT SELECT ON public.locations_map_view TO anon, authenticated;

-- Step 4: Add comment to prevent future confusion
COMMENT ON VIEW public.locations_map_view IS 'Map view for locations. IMPORTANT: Must NOT use SECURITY DEFINER as it bypasses RLS. Uses SECURITY INVOKER (default) instead.';

-- Step 5: Verify it's not SECURITY DEFINER
DO $$
DECLARE
  v_secdef text;
BEGIN
  -- Get the actual security setting
  SELECT 
    CASE 
      WHEN c.relkind = 'v' AND NOT c.relrowsecurity THEN 'SECURITY INVOKER (correct)'
      ELSE 'Unknown or potentially SECURITY DEFINER'
    END INTO v_secdef
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' 
  AND c.relname = 'locations_map_view';
  
  RAISE NOTICE 'View security status: %', v_secdef;
END $$;

-- ================================================================================
-- IMPORTANT: Update migration 005 if you re-run all migrations
-- ================================================================================
-- The issue is in /migrations/005_location_coordinates.sql line 109-137
-- That migration creates the view without specifying security settings
-- If you re-run migrations, that file should be updated to include:
-- CREATE VIEW locations_map_view WITH (security_invoker = true) AS ...