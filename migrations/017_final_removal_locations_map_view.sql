-- ================================================================================
-- Migration: FINAL - Complete Removal of locations_map_view
-- Purpose: Ensure the problematic view is completely removed
-- Date: 2026-02-03
-- 
-- RUN THIS LAST to ensure the view is gone for good
-- ================================================================================

-- Step 1: Drop ANY view with this name
DROP VIEW IF EXISTS public.locations_map_view CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.locations_map_view CASCADE;

-- Step 2: Verify it's gone
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' 
    AND viewname = 'locations_map_view'
  ) THEN
    -- Force drop it again if somehow still exists
    EXECUTE 'DROP VIEW public.locations_map_view CASCADE';
    RAISE WARNING 'View existed after first DROP, forcing removal';
  ELSE
    RAISE NOTICE 'SUCCESS: View locations_map_view has been completely removed';
  END IF;
END $$;

-- Step 3: Ensure we have the replacement function
CREATE OR REPLACE FUNCTION public.get_locations_map_data()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  address text,
  description text,
  latitude numeric,
  longitude numeric,
  view_count integer,
  is_active boolean,
  town_id uuid,
  town_name text,
  town_slug text,
  current_photo_path text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
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
$$;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_locations_map_data() TO anon;
GRANT EXECUTE ON FUNCTION public.get_locations_map_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_locations_map_data() TO service_role;

-- Step 5: Final verification
SELECT 
  'VERIFICATION RESULTS:' as status,
  COUNT(*) as view_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ SUCCESS: No view found - issue resolved!'
    ELSE '❌ ERROR: View still exists - manual intervention required'
  END as result
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'locations_map_view';

-- ================================================================================
-- CRITICAL: UPDATE YOUR APPLICATION
-- ================================================================================
-- Your application MUST be updated to use the function instead of the view:
-- 
-- CHANGE FROM:
--   const { data } = await supabase
--     .from('locations_map_view')
--     .select('*')
-- 
-- CHANGE TO:
--   const { data } = await supabase
--     .rpc('get_locations_map_data')
-- 
-- ================================================================================

-- Add a note to prevent future recreation
COMMENT ON FUNCTION public.get_locations_map_data() IS 
'IMPORTANT: This replaces locations_map_view which was flagged as SECURITY DEFINER. 
DO NOT recreate locations_map_view as a view - use this function instead.
Created in migration 017 to resolve Supabase linter false positive.';

-- ================================================================================
-- CLEANUP: Prevent accidental recreation
-- ================================================================================
-- Create a guard function that will error if someone tries to create the view
CREATE OR REPLACE FUNCTION public.prevent_locations_map_view_creation()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if someone is trying to create locations_map_view
  IF EXISTS (
    SELECT 1 
    FROM pg_event_trigger_ddl_commands() 
    WHERE object_identity = 'public.locations_map_view'
    AND object_type = 'view'
  ) THEN
    RAISE EXCEPTION 'Creation of view locations_map_view is prohibited. Use get_locations_map_data() function instead.';
  END IF;
END;
$$;

-- Create event trigger to prevent view recreation (requires superuser)
-- Uncomment if you have superuser access:
-- CREATE EVENT TRIGGER no_locations_map_view_trigger
-- ON ddl_command_end
-- WHEN TAG IN ('CREATE VIEW', 'CREATE OR REPLACE VIEW')
-- EXECUTE FUNCTION prevent_locations_map_view_creation();