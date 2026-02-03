-- ================================================================================
-- Migration: Performance Optimizations
-- Purpose: Address performance issues identified by Supabase linter
-- Date: 2026-02-03
-- Issues addressed:
--   1. Add missing indexes on foreign keys (5 foreign keys without indexes)
--   2. Remove unused indexes to save storage (6 unused indexes)
-- ================================================================================

-- ================================================================================
-- SECTION 1: Add Missing Indexes on Foreign Keys
-- ================================================================================
-- Foreign key indexes improve JOIN performance and CASCADE operations

-- Index for auto_flag_events.location_id foreign key
CREATE INDEX IF NOT EXISTS idx_auto_flag_events_location_id 
ON public.auto_flag_events(location_id);

-- Index for auto_flag_events.photo_id foreign key
CREATE INDEX IF NOT EXISTS idx_auto_flag_events_photo_id 
ON public.auto_flag_events(photo_id);

-- Index for flags.photo_id foreign key
CREATE INDEX IF NOT EXISTS idx_flags_photo_id 
ON public.flags(photo_id);

-- Index for locations.town_id foreign key
CREATE INDEX IF NOT EXISTS idx_locations_town_id 
ON public.locations(town_id);

-- Index for photos.reverted_from foreign key
CREATE INDEX IF NOT EXISTS idx_photos_reverted_from 
ON public.photos(reverted_from);

-- ================================================================================
-- SECTION 2: Remove Unused Indexes
-- ================================================================================
-- These indexes have never been used according to pg_stat_user_indexes
-- Removing them will save storage space and improve write performance

-- Drop unused index on auto_flag_events
DROP INDEX IF EXISTS public.idx_auto_flag_events_reviewed;

-- Drop unused indexes on locations table
DROP INDEX IF EXISTS public.idx_locations_coordinates;
DROP INDEX IF EXISTS public.idx_locations_business_category;
DROP INDEX IF EXISTS public.idx_locations_business_tags;
DROP INDEX IF EXISTS public.idx_locations_profile_completed;
DROP INDEX IF EXISTS public.idx_locations_active_category;

-- ================================================================================
-- SECTION 3: Add Comments for Documentation
-- ================================================================================

-- Document the purpose of the new indexes
COMMENT ON INDEX idx_auto_flag_events_location_id IS 'Foreign key index for auto_flag_events.location_id - improves JOIN performance';
COMMENT ON INDEX idx_auto_flag_events_photo_id IS 'Foreign key index for auto_flag_events.photo_id - improves JOIN performance';
COMMENT ON INDEX idx_flags_photo_id IS 'Foreign key index for flags.photo_id - improves JOIN and CASCADE DELETE performance';
COMMENT ON INDEX idx_locations_town_id IS 'Foreign key index for locations.town_id - improves queries filtering by town';
COMMENT ON INDEX idx_photos_reverted_from IS 'Foreign key index for photos.reverted_from - improves photo history queries';

-- ================================================================================
-- VERIFICATION QUERIES
-- ================================================================================

-- After running this migration, you can verify the changes with:

-- Check new indexes exist:
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('auto_flag_events', 'flags', 'locations', 'photos') AND indexname LIKE 'idx_%' ORDER BY tablename, indexname;

-- Check that unused indexes were removed:
-- SELECT indexname FROM pg_indexes WHERE indexname IN ('idx_auto_flag_events_reviewed', 'idx_locations_coordinates', 'idx_locations_business_category', 'idx_locations_business_tags', 'idx_locations_profile_completed', 'idx_locations_active_category');

-- Monitor index usage after some time:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY idx_scan;

-- ================================================================================
-- ROLLBACK INSTRUCTIONS
-- ================================================================================

-- If you need to rollback these changes:

-- To remove the new indexes:
-- DROP INDEX IF EXISTS idx_auto_flag_events_location_id;
-- DROP INDEX IF EXISTS idx_auto_flag_events_photo_id;
-- DROP INDEX IF EXISTS idx_flags_photo_id;
-- DROP INDEX IF EXISTS idx_locations_town_id;
-- DROP INDEX IF EXISTS idx_photos_reverted_from;

-- To recreate the removed indexes (if needed):
-- CREATE INDEX idx_auto_flag_events_reviewed ON public.auto_flag_events(is_reviewed);
-- CREATE INDEX idx_locations_coordinates ON public.locations(latitude, longitude);
-- CREATE INDEX idx_locations_business_category ON public.locations(business_category);
-- CREATE INDEX idx_locations_business_tags ON public.locations USING gin(business_tags);
-- CREATE INDEX idx_locations_profile_completed ON public.locations(is_profile_complete);
-- CREATE INDEX idx_locations_active_category ON public.locations(is_active, business_category);