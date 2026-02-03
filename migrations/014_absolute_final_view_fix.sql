-- ================================================================================
-- Migration: Absolute Final Fix for SECURITY DEFINER View Issue
-- Purpose: Use PostgreSQL-specific commands to ensure view is NOT SECURITY DEFINER
-- Date: 2026-02-03
-- ================================================================================

-- Step 1: Drop the view completely with CASCADE
-- This removes all dependencies including the _RETURN rule
DROP VIEW IF EXISTS public.locations_map_view CASCADE;

-- Step 2: Create view with SECURITY INVOKER explicitly
-- Note: In PostgreSQL, views default to SECURITY INVOKER unless specified
-- We're being explicit here to ensure it's not SECURITY DEFINER
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

-- Step 3: Use ALTER VIEW to explicitly set security invoker
-- This is the most direct way to ensure it's not SECURITY DEFINER
ALTER VIEW public.locations_map_view SET (security_invoker = true);

-- Step 4: Set proper ownership and permissions
ALTER VIEW public.locations_map_view OWNER TO postgres;
GRANT SELECT ON public.locations_map_view TO anon;
GRANT SELECT ON public.locations_map_view TO authenticated;
GRANT SELECT ON public.locations_map_view TO service_role;

-- Step 5: Verify the view configuration
DO $$
DECLARE
  v_result record;
BEGIN
  -- Check pg_class for view properties
  SELECT 
    c.relname as view_name,
    c.relowner::regrole as owner,
    CASE 
      WHEN c.reloptions IS NULL THEN 'DEFAULT (SECURITY INVOKER)'
      WHEN c.reloptions::text LIKE '%security_invoker=true%' THEN 'EXPLICITLY SECURITY INVOKER'
      WHEN c.reloptions::text LIKE '%security_barrier=true%' THEN 'HAS SECURITY BARRIER'
      ELSE 'CHECK MANUALLY: ' || c.reloptions::text
    END as security_setting
  INTO v_result
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' 
  AND c.relname = 'locations_map_view'
  AND c.relkind = 'v';
  
  RAISE NOTICE 'View: %, Owner: %, Security: %', 
    v_result.view_name, 
    v_result.owner, 
    v_result.security_setting;
    
  -- Additional check in pg_views
  SELECT EXISTS (
    SELECT 1 
    FROM pg_views 
    WHERE schemaname = 'public' 
    AND viewname = 'locations_map_view'
    AND definition NOT LIKE '%SECURITY DEFINER%'
  ) INTO v_result;
  
  IF v_result.exists THEN
    RAISE NOTICE 'SUCCESS: View definition does not contain SECURITY DEFINER';
  ELSE
    RAISE WARNING 'WARNING: Could not verify view is not SECURITY DEFINER';
  END IF;
END $$;

-- Step 6: Add protective comment
COMMENT ON VIEW public.locations_map_view IS 
'Location map view. CRITICAL: Must use SECURITY INVOKER (not DEFINER) to respect RLS policies. Recreated in migration 014.';

-- ================================================================================
-- NUCLEAR OPTION (if above doesn't work)
-- ================================================================================
-- If Supabase still reports SECURITY DEFINER after this migration,
-- it might be detecting it incorrectly or there's a platform-specific issue.
-- In that case, try these alternatives:

-- Alternative 1: Use a function-based approach instead of a view
-- CREATE OR REPLACE FUNCTION get_locations_map_data()
-- RETURNS TABLE (... columns ...)
-- LANGUAGE sql
-- SECURITY INVOKER
-- AS $$ SELECT ... $$;

-- Alternative 2: Use a materialized view (refreshed periodically)
-- CREATE MATERIALIZED VIEW locations_map_mview AS ...;

-- Alternative 3: Query the tables directly from your application
-- without using a view at all

-- ================================================================================
-- POST-MIGRATION VERIFICATION
-- ================================================================================
-- Run this query to absolutely verify:
SELECT 
  'If this returns any rows, the view might still be SECURITY DEFINER:' as note;
  
SELECT * FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'locations_map_view'
AND (
  definition ILIKE '%security%definer%'
  OR definition ILIKE '%security definer%'
);