# Security Fix Migration Guide

## Overview
This migration addresses critical security vulnerabilities identified by Supabase's security linter.

## Issues Fixed

### Critical (ERROR level)
1. **RLS Disabled on Public Tables**
   - `admin_config` table - Now protected with admin-only RLS policies
   - `auto_flag_events` table - Now protected with appropriate RLS policies

2. **Security Definer View**
   - `locations_map_view` - Recreated without SECURITY DEFINER

### Warnings (WARN level)
1. **Function Search Path Vulnerabilities** - Fixed 11 functions by adding `SET search_path`
2. **Overly Permissive RLS Policies** - Replaced with role-based access control
3. **Leaked Password Protection** - Instructions included for dashboard configuration

## How to Apply the Migration

### Step 1: Review the Migration
```bash
cat migrations/008_comprehensive_security_fixes.sql
```

### Step 2: Apply to Supabase
Run the migration in your Supabase SQL editor:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `migrations/008_comprehensive_security_fixes.sql`
4. Execute the migration

### Step 3: Enable Leaked Password Protection
1. Go to Supabase Dashboard
2. Navigate to Authentication > Settings > Security
3. Enable "Leaked password protection"

### Step 4: Set Up Admin Users
To create admin users with proper permissions:
```sql
-- After creating a user via Authentication dashboard, run:
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';
```

### Step 5: Verify the Fixes
Run these verification queries:
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('admin_config', 'auto_flag_events');

-- Check function search paths
SELECT proname, prosecdef, proconfig 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
AND proname IN ('update_towns_updated_at', 'calculate_distance', 'increment_view_count');

-- Check view is not SECURITY DEFINER
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'locations_map_view';
```

## Important Notes

### Admin Access
- The migration restricts many operations to authenticated admin users only
- Public users can still:
  - View active locations and towns
  - View non-flagged photos
  - Upload photos (with rate limiting considerations)
  - Flag inappropriate content

### Breaking Changes
- Direct table modifications now require admin role
- Previous "authenticated" access is now restricted to admin-role users
- Consider implementing proper rate limiting for public uploads

### Rate Limiting
The migration includes placeholder functions for rate limiting. In production, implement:
- IP-based rate limiting for anonymous uploads
- User-based rate limiting for authenticated users
- Consider using Supabase Edge Functions for advanced rate limiting

## Testing Checklist
- [ ] Public users can view locations
- [ ] Public users can upload photos
- [ ] Admin users can modify all tables
- [ ] Non-admin authenticated users cannot modify protected tables
- [ ] Flag threshold auto-flagging works
- [ ] View count increment works
- [ ] Location search functions work

## Rollback
If needed, create a rollback migration that:
1. Removes the stricter RLS policies
2. Recreates the original policies
3. Removes the search_path settings from functions

## Support
For issues or questions about this migration:
1. Check Supabase logs for any errors
2. Review the RLS policies in the Dashboard
3. Ensure your admin users have proper metadata set