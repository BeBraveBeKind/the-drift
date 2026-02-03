-- ================================================================================
-- Migration: Force Fix Security Definer View
-- Purpose: Aggressively fix the SECURITY DEFINER view that keeps reappearing
-- Date: 2026-02-03
-- ================================================================================

-- First, drop ANY existing view with CASCADE to remove dependencies
DROP VIEW IF EXISTS public.locations_map_view CASCADE;

-- Also check for any materialized views with same name
DROP MATERIALIZED VIEW IF EXISTS public.locations_map_view CASCADE;

-- Create the view explicitly WITHOUT security definer
-- Using CREATE OR REPLACE won't work if security settings differ
CREATE VIEW public.locations_map_view 
WITH (security_invoker = true) -- Explicitly set security invoker
AS
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
LEFT JOIN public.photos p ON p.location_id = l.id AND p.is_current = true
WHERE l.is_active = true;

-- Set ownership to postgres (or supabase_admin)
ALTER VIEW public.locations_map_view OWNER TO postgres;

-- Grant appropriate permissions
GRANT SELECT ON public.locations_map_view TO anon;
GRANT SELECT ON public.locations_map_view TO authenticated;

-- Verify the view is not SECURITY DEFINER
DO $$
DECLARE
  v_is_security_definer boolean;
BEGIN
  -- Check if view has security definer
  SELECT 
    CASE 
      WHEN definition LIKE '%SECURITY DEFINER%' THEN true
      ELSE false
    END INTO v_is_security_definer
  FROM pg_views 
  WHERE schemaname = 'public' 
  AND viewname = 'locations_map_view';
  
  IF v_is_security_definer THEN
    RAISE WARNING 'View locations_map_view still appears to have SECURITY DEFINER. Manual intervention may be required.';
  ELSE
    RAISE NOTICE 'View locations_map_view successfully created without SECURITY DEFINER.';
  END IF;
END $$;

-- Additional check: Look for any triggers or rules that might be recreating the view
SELECT 
  'Trigger: ' || tgname as object_name,
  'On table: ' || c.relname as details
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE pg_get_triggerdef(t.oid) LIKE '%locations_map_view%'
UNION ALL
SELECT 
  'Rule: ' || rulename as object_name,
  'On table: ' || c.relname as details
FROM pg_rewrite r
JOIN pg_class c ON r.ev_class = c.oid
WHERE pg_get_ruledef(r.oid) LIKE '%locations_map_view%';

-- ================================================================================
-- IMPORTANT NOTES:
-- ================================================================================
-- If this view keeps coming back as SECURITY DEFINER, check:
-- 1. Any migration files that might be re-creating it
-- 2. Supabase dashboard settings or policies
-- 3. Any database functions that might be creating views
-- 4. Application code that might be running CREATE VIEW statements

-- To permanently fix, you may need to:
-- 1. Search all SQL files: grep -r "locations_map_view" .
-- 2. Check Supabase dashboard for any auto-generated views
-- 3. Look for any database migrations that run on deploy