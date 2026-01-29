-- Photo History Migration
-- Adds functionality to track and revert photo versions
-- Date: 2026-01-29

-- =====================================================
-- PART 1: Add metadata columns to photos table
-- =====================================================

-- Add uploaded_by column to track who uploaded the photo
ALTER TABLE photos ADD COLUMN IF NOT EXISTS uploaded_by text;

-- Add uploaded_at column if it doesn't exist (created_at should already exist)
ALTER TABLE photos ADD COLUMN IF NOT EXISTS uploaded_at timestamptz DEFAULT now();

-- Add flag_reason column to track why a photo was flagged
ALTER TABLE photos ADD COLUMN IF NOT EXISTS flag_reason text;

-- Add reverted_from column to track which photo this was reverted from
ALTER TABLE photos ADD COLUMN IF NOT EXISTS reverted_from uuid REFERENCES photos(id);

-- Create index for faster history queries
CREATE INDEX IF NOT EXISTS idx_photos_location_id_uploaded_at 
ON photos(location_id, uploaded_at DESC);

-- =====================================================
-- PART 2: Functions for Photo History Management
-- =====================================================

-- Function to get photo history for a location
CREATE OR REPLACE FUNCTION get_photo_history(
  p_location_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  storage_path text,
  is_current boolean,
  is_flagged boolean,
  flag_reason text,
  uploaded_at timestamptz,
  uploaded_by text,
  reverted_from uuid,
  photo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.storage_path,
    p.is_current,
    p.is_flagged,
    p.flag_reason,
    p.uploaded_at,
    p.uploaded_by,
    p.reverted_from,
    CONCAT(
      'https://', 
      current_setting('app.supabase_url', true)::text,
      '/storage/v1/object/public/board-photos/',
      p.storage_path
    ) as photo_url
  FROM photos p
  WHERE p.location_id = p_location_id
  ORDER BY p.uploaded_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to revert to a previous photo
CREATE OR REPLACE FUNCTION admin_revert_photo(
  p_location_id uuid,
  p_photo_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_photo_id uuid;
  v_storage_path text;
  v_result jsonb;
BEGIN
  -- Check if the target photo exists and belongs to the location
  SELECT storage_path INTO v_storage_path
  FROM photos 
  WHERE id = p_photo_id 
    AND location_id = p_location_id;
  
  IF v_storage_path IS NULL THEN
    RAISE EXCEPTION 'Photo not found or does not belong to this location';
  END IF;
  
  -- Get the current photo ID
  SELECT id INTO v_current_photo_id
  FROM photos
  WHERE location_id = p_location_id
    AND is_current = true
  LIMIT 1;
  
  -- Flag the current photo if reason is provided
  IF p_reason IS NOT NULL AND v_current_photo_id IS NOT NULL THEN
    UPDATE photos
    SET is_flagged = true,
        flag_reason = p_reason,
        is_current = false
    WHERE id = v_current_photo_id;
  ELSE
    -- Just mark it as not current
    UPDATE photos
    SET is_current = false
    WHERE location_id = p_location_id
      AND is_current = true;
  END IF;
  
  -- Set the selected photo as current
  UPDATE photos
  SET is_current = true,
      is_flagged = false,
      flag_reason = NULL
  WHERE id = p_photo_id;
  
  -- Update location timestamp
  UPDATE locations 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = p_location_id;
  
  -- Return result
  SELECT jsonb_build_object(
    'success', true,
    'reverted_to_photo_id', p_photo_id,
    'previous_photo_id', v_current_photo_id,
    'storage_path', v_storage_path
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Function to flag a photo without reverting
CREATE OR REPLACE FUNCTION admin_flag_photo(
  p_photo_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE photos
  SET is_flagged = true,
      flag_reason = p_reason,
      is_current = false
  WHERE id = p_photo_id;
  
  -- If this was the current photo, find the next best one
  IF EXISTS (
    SELECT 1 FROM photos 
    WHERE id = p_photo_id AND is_current = false
  ) THEN
    -- Set the most recent unflagged photo as current
    UPDATE photos
    SET is_current = true
    WHERE id = (
      SELECT id 
      FROM photos 
      WHERE location_id = (SELECT location_id FROM photos WHERE id = p_photo_id)
        AND is_flagged = false
        AND id != p_photo_id
      ORDER BY uploaded_at DESC
      LIMIT 1
    );
  END IF;
END;
$$;

-- =====================================================
-- PART 3: Permissions
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_photo_history TO authenticated;
GRANT EXECUTE ON FUNCTION admin_revert_photo TO authenticated;
GRANT EXECUTE ON FUNCTION admin_flag_photo TO authenticated;

-- Grant execute permissions to anon for read-only function
GRANT EXECUTE ON FUNCTION get_photo_history TO anon;

-- =====================================================
-- PART 4: Backfill existing data
-- =====================================================

-- Set uploaded_at for existing photos based on created_at if available
UPDATE photos 
SET uploaded_at = created_at 
WHERE uploaded_at IS NULL AND created_at IS NOT NULL;

-- Set a default uploaded_at for photos without any timestamp
UPDATE photos 
SET uploaded_at = NOW() - (random() * INTERVAL '30 days')
WHERE uploaded_at IS NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Photo history migration complete' AS status;

-- Verify functions exist
SELECT proname, pronargs 
FROM pg_proc 
WHERE proname IN ('get_photo_history', 'admin_revert_photo', 'admin_flag_photo');

-- Show sample of photos with new columns
SELECT id, location_id, is_current, is_flagged, uploaded_at
FROM photos
LIMIT 5;