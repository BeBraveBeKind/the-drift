-- ================================================================================
-- Migration: CRITICAL Security Fix
-- Purpose: Fix critical security vulnerabilities that reappeared
-- Date: 2026-02-03
-- CRITICAL Issues:
--   1. ERROR: Security definer view vulnerability (locations_map_view)
--   2. ERROR: user_metadata references in RLS (user-editable, security risk!)
-- ================================================================================

-- ================================================================================
-- SECTION 1: Fix Security Definer View (CRITICAL)
-- ================================================================================

-- Drop and recreate the view WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.locations_map_view CASCADE;

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
FROM locations l
LEFT JOIN towns t ON l.town_id = t.id
LEFT JOIN photos p ON p.location_id = l.id AND p.is_current = true
WHERE l.is_active = true;

-- Grant appropriate permissions
GRANT SELECT ON public.locations_map_view TO anon, authenticated;

-- ================================================================================
-- SECTION 2: Fix user_metadata References (CRITICAL SECURITY ISSUE)
-- ================================================================================
-- user_metadata is editable by users! Use raw_user_meta_data instead

-- Create admin users table for secure admin management
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can view admin users
CREATE POLICY "Admin users viewable by admins only"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- Only existing admins can add new admins
CREATE POLICY "Only admins can manage admin users"
  ON public.admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- Update is_admin function to use admin_users table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (SELECT auth.uid())
  );
END;
$$;

-- ================================================================================
-- SECTION 3: Fix All RLS Policies to Use Secure Admin Check
-- ================================================================================

-- Fix admin_config policies
DROP POLICY IF EXISTS "Admin config viewable by authenticated admins" ON public.admin_config;
CREATE POLICY "Admin config viewable by authenticated admins"
  ON public.admin_config
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin config modifiable by authenticated admins" ON public.admin_config;
CREATE POLICY "Admin config modifiable by authenticated admins"
  ON public.admin_config
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Fix locations admin policies
DROP POLICY IF EXISTS "Authenticated admins can insert locations" ON public.locations;
CREATE POLICY "Authenticated admins can insert locations"
  ON public.locations
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated admins can update locations" ON public.locations;
CREATE POLICY "Authenticated admins can update locations"
  ON public.locations
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated admins can delete locations" ON public.locations;
CREATE POLICY "Authenticated admins can delete locations"
  ON public.locations
  FOR DELETE
  USING (public.is_admin());

-- Fix photos admin policies
DROP POLICY IF EXISTS "Authenticated admins can update photos" ON public.photos;
CREATE POLICY "Authenticated admins can update photos"
  ON public.photos
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated admins can delete photos" ON public.photos;
CREATE POLICY "Authenticated admins can delete photos"
  ON public.photos
  FOR DELETE
  USING (public.is_admin());

-- Fix towns admin policies
DROP POLICY IF EXISTS "Authenticated admins can insert towns" ON public.towns;
CREATE POLICY "Authenticated admins can insert towns"
  ON public.towns
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated admins can update towns" ON public.towns;
CREATE POLICY "Authenticated admins can update towns"
  ON public.towns
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated admins can delete towns" ON public.towns;
CREATE POLICY "Authenticated admins can delete towns"
  ON public.towns
  FOR DELETE
  USING (public.is_admin());

-- ================================================================================
-- SECTION 4: Bootstrap First Admin User
-- ================================================================================

-- IMPORTANT: After running this migration, immediately add your first admin:
-- INSERT INTO public.admin_users (user_id) 
-- SELECT id FROM auth.users WHERE email = 'your-admin@example.com';

-- Or if you want to make the first user an admin automatically:
DO $$
BEGIN
  -- Only insert if table is empty (first time setup)
  IF NOT EXISTS (SELECT 1 FROM public.admin_users) THEN
    -- Make the first authenticated user an admin (optional)
    INSERT INTO public.admin_users (user_id)
    SELECT id FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

-- ================================================================================
-- VERIFICATION QUERIES
-- ================================================================================

-- Check the view is not SECURITY DEFINER:
-- SELECT viewname, definition 
-- FROM pg_views 
-- WHERE schemaname = 'public' 
-- AND viewname = 'locations_map_view';

-- Check admin users:
-- SELECT au.*, u.email 
-- FROM public.admin_users au
-- JOIN auth.users u ON au.user_id = u.id;

-- Test is_admin function:
-- SELECT public.is_admin();

-- ================================================================================
-- IMPORTANT POST-MIGRATION STEPS
-- ================================================================================

-- 1. Add admin users via SQL:
--    INSERT INTO public.admin_users (user_id) 
--    SELECT id FROM auth.users WHERE email IN ('admin1@example.com', 'admin2@example.com');

-- 2. Remove any raw_user_meta_data role assignments:
--    UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data - 'role';

-- 3. Verify no policies reference user_metadata or jwt()->>'role'