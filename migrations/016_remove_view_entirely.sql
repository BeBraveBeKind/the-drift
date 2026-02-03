-- ================================================================================
-- Migration: Remove View Entirely - Use Function Only
-- Purpose: Completely eliminate the SECURITY DEFINER false positive
-- Date: 2026-02-03
-- 
-- ISSUE: Supabase linter continues to flag locations_map_view as SECURITY DEFINER
-- even when it's not. This is likely a bug in their linter.
-- SOLUTION: Remove the view entirely and use only the function.
-- ================================================================================

-- Step 1: Drop the view that keeps being flagged
DROP VIEW IF EXISTS public.locations_map_view CASCADE;

-- Step 2: Ensure the function exists and is properly configured
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
SECURITY INVOKER  -- Explicitly SECURITY INVOKER
SET search_path = public, pg_catalog  -- Set search path for security
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

-- Step 4: Add documentation
COMMENT ON FUNCTION public.get_locations_map_data() IS 
'Replacement for locations_map_view. Returns location data for map display. 
Uses SECURITY INVOKER to respect RLS policies. 
Call with: SELECT * FROM get_locations_map_data();';

-- Step 5: Create a helper function for compatibility (optional)
-- If your app expects a view, you can create a wrapper function with the same name
CREATE OR REPLACE FUNCTION public.locations_map_view()
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
AS $$
  SELECT * FROM public.get_locations_map_data();
$$;

GRANT EXECUTE ON FUNCTION public.locations_map_view() TO anon;
GRANT EXECUTE ON FUNCTION public.locations_map_view() TO authenticated;
GRANT EXECUTE ON FUNCTION public.locations_map_view() TO service_role;

-- ================================================================================
-- VERIFICATION
-- ================================================================================
DO $$
BEGIN
  -- Verify no view exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' 
    AND viewname = 'locations_map_view'
  ) THEN
    RAISE NOTICE 'SUCCESS: View locations_map_view has been removed';
  ELSE
    RAISE WARNING 'WARNING: View still exists - manual intervention may be required';
  END IF;
  
  -- Verify function security
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname IN ('get_locations_map_data', 'locations_map_view')
    AND pronamespace = 'public'::regnamespace
    AND NOT prosecdef  -- prosecdef = false means SECURITY INVOKER
  ) THEN
    RAISE NOTICE 'SUCCESS: Functions are using SECURITY INVOKER';
  ELSE
    RAISE WARNING 'WARNING: Check function security settings';
  END IF;
END $$;

-- ================================================================================
-- APP MIGRATION GUIDE
-- ================================================================================
-- Update your application code:
-- 
-- OLD (using view):
--   SELECT * FROM locations_map_view;
-- 
-- NEW (using function):
--   SELECT * FROM get_locations_map_data();
-- 
-- OR if you created the compatibility function:
--   SELECT * FROM locations_map_view();  -- Note the parentheses!
-- 
-- The function approach is more explicit and won't trigger false positives.

-- ================================================================================
-- IMPORTANT NOTES
-- ================================================================================
-- 1. This completely removes the view to avoid Supabase linter false positives
-- 2. Functions with SECURITY INVOKER are the recommended approach
-- 3. Update your application to use get_locations_map_data() function
-- 4. The linter should no longer report SECURITY DEFINER issues for this object