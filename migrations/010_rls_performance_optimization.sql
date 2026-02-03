-- ================================================================================
-- Migration: RLS Performance Optimization
-- Purpose: Fix RLS performance issues identified by Supabase linter
-- Date: 2026-02-03
-- Issues addressed:
--   1. Auth RLS Initialization Plan - wrap auth functions in SELECT subqueries
--   2. Multiple Permissive Policies - consolidate duplicate SELECT policies
-- ================================================================================

-- ================================================================================
-- SECTION 1: Fix Auth RLS Initialization Plan Issues
-- ================================================================================
-- Wrap auth functions in SELECT to prevent re-evaluation for each row

-- Fix admin_config policies
DROP POLICY IF EXISTS "Admin config viewable by authenticated admins" ON public.admin_config;
CREATE POLICY "Admin config viewable by authenticated admins"
  ON public.admin_config
  FOR SELECT
  USING (
    (SELECT auth.role()) = 'authenticated' 
    AND (SELECT auth.jwt() ->> 'email') IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin config modifiable by authenticated admins" ON public.admin_config;
CREATE POLICY "Admin config modifiable by authenticated admins"
  ON public.admin_config
  FOR ALL
  USING (
    (SELECT auth.role()) = 'authenticated' 
    AND (SELECT auth.jwt() ->> 'email') IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    (SELECT auth.role()) = 'authenticated' 
    AND (SELECT auth.jwt() ->> 'email') IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Fix locations admin policies
DROP POLICY IF EXISTS "Authenticated admins can insert locations" ON public.locations;
CREATE POLICY "Authenticated admins can insert locations"
  ON public.locations
  FOR INSERT
  WITH CHECK (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated admins can update locations" ON public.locations;
CREATE POLICY "Authenticated admins can update locations"
  ON public.locations
  FOR UPDATE
  USING (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  )
  WITH CHECK (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated admins can delete locations" ON public.locations;
CREATE POLICY "Authenticated admins can delete locations"
  ON public.locations
  FOR DELETE
  USING (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Fix photos admin policies
DROP POLICY IF EXISTS "Authenticated admins can update photos" ON public.photos;
CREATE POLICY "Authenticated admins can update photos"
  ON public.photos
  FOR UPDATE
  USING (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  )
  WITH CHECK (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated admins can delete photos" ON public.photos;
CREATE POLICY "Authenticated admins can delete photos"
  ON public.photos
  FOR DELETE
  USING (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Fix towns admin policies
DROP POLICY IF EXISTS "Authenticated admins can insert towns" ON public.towns;
CREATE POLICY "Authenticated admins can insert towns"
  ON public.towns
  FOR INSERT
  WITH CHECK (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated admins can update towns" ON public.towns;
CREATE POLICY "Authenticated admins can update towns"
  ON public.towns
  FOR UPDATE
  USING (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  )
  WITH CHECK (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated admins can delete towns" ON public.towns;
CREATE POLICY "Authenticated admins can delete towns"
  ON public.towns
  FOR DELETE
  USING (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Update is_admin function to also use SELECT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN (
    (SELECT auth.role()) = 'authenticated' 
    AND (
      (SELECT auth.jwt() ->> 'role') = 'admin' 
      OR (SELECT auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      OR EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = (SELECT auth.uid()) 
        AND raw_user_meta_data->>'role' = 'admin'
      )
    )
  );
END;
$$;

-- ================================================================================
-- SECTION 2: Consolidate Multiple Permissive Policies
-- ================================================================================
-- Remove duplicate SELECT policies to improve performance

-- Clean up admin_config duplicate SELECT policies
-- Keep only the necessary one for SELECT, the ALL policy handles other operations

-- Clean up locations duplicate SELECT policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.locations;
DROP POLICY IF EXISTS "Locations are viewable by everyone" ON public.locations;
-- Keep only "Public read access to active locations"

-- Clean up photos duplicate SELECT policies  
DROP POLICY IF EXISTS "All photos viewable for history" ON public.photos;
DROP POLICY IF EXISTS "Current photos are viewable by everyone" ON public.photos;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.photos;
-- Keep only "Public read access to photos"

-- Clean up towns duplicate SELECT policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.towns;
-- Keep only "Public read access to active towns"

-- ================================================================================
-- VERIFICATION QUERIES
-- ================================================================================

-- Check for remaining auth RLS initialization issues:
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND definition LIKE '%auth.%' 
-- AND definition NOT LIKE '%(SELECT auth.%';

-- Check for multiple permissive policies:
-- SELECT tablename, cmd, COUNT(*) as policy_count
-- FROM pg_policies  
-- WHERE schemaname = 'public'
-- AND permissive = 'PERMISSIVE'
-- GROUP BY tablename, cmd
-- HAVING COUNT(*) > 1;