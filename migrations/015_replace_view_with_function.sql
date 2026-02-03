-- ================================================================================
-- Migration: Replace View with Function (Alternative Approach)
-- Purpose: If view keeps being flagged as SECURITY DEFINER, use a function instead
-- Date: 2026-02-03
-- ================================================================================

-- Step 1: Drop the problematic view
DROP VIEW IF EXISTS public.locations_map_view CASCADE;

-- Step 2: Create a table function that returns the same data
-- Functions can explicitly set SECURITY INVOKER and are less problematic
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
SECURITY INVOKER  -- Explicitly run with invoker's permissions
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

-- Step 3: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_locations_map_data() TO anon;
GRANT EXECUTE ON FUNCTION public.get_locations_map_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_locations_map_data() TO service_role;

-- Step 4: Create a simple view that calls the function (optional)
-- This gives you view-like syntax while using the function
CREATE VIEW public.locations_map_view AS
SELECT * FROM public.get_locations_map_data();

-- Step 5: Grant permissions on the view
GRANT SELECT ON public.locations_map_view TO anon;
GRANT SELECT ON public.locations_map_view TO authenticated;
GRANT SELECT ON public.locations_map_view TO service_role;

-- Step 6: Add documentation
COMMENT ON FUNCTION public.get_locations_map_data() IS 
'Returns location data for map display. Uses SECURITY INVOKER to respect RLS policies.';

COMMENT ON VIEW public.locations_map_view IS 
'View wrapper around get_locations_map_data() function. Created to avoid SECURITY DEFINER issues.';

-- ================================================================================
-- USAGE NOTES
-- ================================================================================
-- You can now query the data in two ways:
-- 1. Using the function: SELECT * FROM get_locations_map_data();
-- 2. Using the view: SELECT * FROM locations_map_view;
--
-- Both will respect RLS policies because the function uses SECURITY INVOKER

-- ================================================================================
-- VERIFICATION
-- ================================================================================
DO $$
DECLARE
  v_func_security text;
  v_view_def text;
BEGIN
  -- Check function security
  SELECT 
    CASE 
      WHEN prosecdef THEN 'SECURITY DEFINER (BAD!)'
      ELSE 'SECURITY INVOKER (Good!)'
    END INTO v_func_security
  FROM pg_proc
  WHERE proname = 'get_locations_map_data'
  AND pronamespace = 'public'::regnamespace;
  
  RAISE NOTICE 'Function security: %', v_func_security;
  
  -- Check if view exists and its definition
  SELECT definition INTO v_view_def
  FROM pg_views
  WHERE schemaname = 'public' 
  AND viewname = 'locations_map_view';
  
  IF v_view_def IS NOT NULL THEN
    IF v_view_def LIKE '%get_locations_map_data%' THEN
      RAISE NOTICE 'View successfully uses function approach';
    ELSE
      RAISE WARNING 'View exists but does not use function approach';
    END IF;
  END IF;
END $$;

-- ================================================================================
-- ROLLBACK INSTRUCTIONS
-- ================================================================================
-- To revert to direct view approach:
-- DROP FUNCTION IF EXISTS public.get_locations_map_data() CASCADE;
-- Then recreate the view as needed