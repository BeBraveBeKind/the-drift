-- Auto-Flag Threshold Migration
-- Automatically flags and hides photos that receive multiple community reports
-- Date: 2026-01-29

-- =====================================================
-- PART 1: Configuration Table for Thresholds
-- =====================================================

-- Create a config table to make thresholds adjustable without code changes
CREATE TABLE IF NOT EXISTS admin_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

-- Insert default flag threshold configuration
INSERT INTO admin_config (key, value, description)
VALUES (
  'flag_threshold',
  '{"count": 3, "action": "auto_hide", "notify_admin": true}',
  'Number of community flags before auto-hiding a photo'
)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- PART 2: Auto-Flag Threshold Function
-- =====================================================

CREATE OR REPLACE FUNCTION check_flag_threshold()
RETURNS TRIGGER AS $$
DECLARE
  v_threshold integer;
  v_location_name text;
  v_previous_photo_id uuid;
BEGIN
  -- Get threshold from config (default to 3 if not found)
  SELECT (value->>'count')::integer INTO v_threshold
  FROM admin_config
  WHERE key = 'flag_threshold';
  
  IF v_threshold IS NULL THEN
    v_threshold := 3;
  END IF;

  -- Check if photo has reached the flag threshold
  IF NEW.flag_count >= v_threshold AND OLD.is_flagged = false THEN
    -- Mark as flagged with auto-flag reason
    NEW.is_flagged := true;
    
    -- Set flag reason if not already set
    IF NEW.flag_reason IS NULL THEN
      NEW.flag_reason := format('Auto-flagged: Received %s community reports', NEW.flag_count);
    END IF;
    
    -- If this is the current photo, switch to the previous best photo
    IF NEW.is_current = true THEN
      NEW.is_current := false;
      
      -- Find and set the most recent unflagged photo as current
      SELECT id INTO v_previous_photo_id
      FROM photos
      WHERE location_id = NEW.location_id
        AND id != NEW.id
        AND is_flagged = false
      ORDER BY uploaded_at DESC
      LIMIT 1;
      
      IF v_previous_photo_id IS NOT NULL THEN
        UPDATE photos
        SET is_current = true
        WHERE id = v_previous_photo_id;
        
        -- Log the auto-switch
        RAISE NOTICE 'Auto-switched from flagged photo % to previous photo %', NEW.id, v_previous_photo_id;
      ELSE
        -- No unflagged photos available - location has no valid photo
        RAISE WARNING 'Location % has no unflagged photos available after auto-flag', NEW.location_id;
      END IF;
    END IF;
    
    -- Get location name for logging
    SELECT name INTO v_location_name
    FROM locations
    WHERE id = NEW.location_id;
    
    -- Log the auto-flag event
    RAISE NOTICE 'Photo % for location "%" auto-flagged after % reports', 
                 NEW.id, v_location_name, NEW.flag_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 3: Create Trigger for Auto-Flagging
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_flag_on_threshold ON photos;

-- Create trigger that fires when flag_count is updated
CREATE TRIGGER auto_flag_on_threshold
BEFORE UPDATE OF flag_count ON photos
FOR EACH ROW
WHEN (NEW.flag_count > OLD.flag_count)  -- Only when count increases
EXECUTE FUNCTION check_flag_threshold();

-- =====================================================
-- PART 4: Admin Notification Table (Optional)
-- =====================================================

-- Create table to track auto-flag events for admin review
CREATE TABLE IF NOT EXISTS auto_flag_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid REFERENCES photos(id) ON DELETE CASCADE,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  flag_count integer,
  auto_flagged_at timestamptz DEFAULT now(),
  reviewed boolean DEFAULT false,
  reviewed_at timestamptz,
  reviewed_by text,
  action_taken text  -- 'approved', 'removed', 'reverted'
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_auto_flag_events_reviewed 
ON auto_flag_events(reviewed, auto_flagged_at DESC);

-- =====================================================
-- PART 5: Function to Record Auto-Flag Events
-- =====================================================

CREATE OR REPLACE FUNCTION record_auto_flag_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if photo was just auto-flagged
  IF NEW.is_flagged = true AND OLD.is_flagged = false 
     AND NEW.flag_reason LIKE 'Auto-flagged:%' THEN
    
    INSERT INTO auto_flag_events (
      photo_id,
      location_id,
      flag_count
    ) VALUES (
      NEW.id,
      NEW.location_id,
      NEW.flag_count
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to record auto-flag events
DROP TRIGGER IF EXISTS record_auto_flag ON photos;
CREATE TRIGGER record_auto_flag
AFTER UPDATE ON photos
FOR EACH ROW
WHEN (NEW.is_flagged = true AND OLD.is_flagged = false)
EXECUTE FUNCTION record_auto_flag_event();

-- =====================================================
-- PART 6: Admin Functions
-- =====================================================

-- Function to get pending auto-flagged photos for review
CREATE OR REPLACE FUNCTION get_auto_flagged_for_review()
RETURNS TABLE (
  event_id uuid,
  photo_id uuid,
  location_id uuid,
  location_name text,
  location_slug text,
  town text,
  flag_count integer,
  auto_flagged_at timestamptz,
  storage_path text,
  photo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as event_id,
    e.photo_id,
    e.location_id,
    l.name as location_name,
    l.slug as location_slug,
    l.town,
    e.flag_count,
    e.auto_flagged_at,
    p.storage_path,
    CONCAT(
      'https://', 
      current_setting('app.supabase_url', true)::text,
      '/storage/v1/object/public/board-photos/',
      p.storage_path
    ) as photo_url
  FROM auto_flag_events e
  JOIN photos p ON e.photo_id = p.id
  JOIN locations l ON e.location_id = l.id
  WHERE e.reviewed = false
  ORDER BY e.auto_flagged_at DESC;
END;
$$;

-- Function to mark auto-flag event as reviewed
CREATE OR REPLACE FUNCTION mark_auto_flag_reviewed(
  p_event_id uuid,
  p_action text,
  p_reviewer text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auto_flag_events
  SET 
    reviewed = true,
    reviewed_at = now(),
    reviewed_by = p_reviewer,
    action_taken = p_action
  WHERE id = p_event_id;
END;
$$;

-- Function to update flag threshold
CREATE OR REPLACE FUNCTION update_flag_threshold(
  p_count integer,
  p_updated_by text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_count < 1 OR p_count > 100 THEN
    RAISE EXCEPTION 'Flag threshold must be between 1 and 100';
  END IF;
  
  UPDATE admin_config
  SET 
    value = jsonb_build_object(
      'count', p_count,
      'action', 'auto_hide',
      'notify_admin', true
    ),
    updated_at = now(),
    updated_by = p_updated_by
  WHERE key = 'flag_threshold';
END;
$$;

-- =====================================================
-- PART 7: Permissions
-- =====================================================

-- Grant permissions to authenticated users (admins)
GRANT SELECT, UPDATE ON admin_config TO authenticated;
GRANT ALL ON auto_flag_events TO authenticated;
GRANT EXECUTE ON FUNCTION get_auto_flagged_for_review TO authenticated;
GRANT EXECUTE ON FUNCTION mark_auto_flag_reviewed TO authenticated;
GRANT EXECUTE ON FUNCTION update_flag_threshold TO authenticated;

-- =====================================================
-- PART 8: Backfill - Check existing photos
-- =====================================================

-- Check if any existing photos should be auto-flagged based on current count
UPDATE photos
SET 
  is_flagged = true,
  flag_reason = format('Auto-flagged: Received %s community reports', flag_count),
  is_current = false
WHERE flag_count >= 3
  AND is_flagged = false;

-- Switch to alternative photos for any that were just flagged
UPDATE photos p1
SET is_current = true
WHERE p1.id IN (
  SELECT DISTINCT ON (p2.location_id) p2.id
  FROM photos p2
  WHERE p2.is_flagged = false
    AND EXISTS (
      SELECT 1 FROM photos p3
      WHERE p3.location_id = p2.location_id
        AND p3.is_flagged = true
        AND p3.flag_count >= 3
        AND NOT EXISTS (
          SELECT 1 FROM photos p4
          WHERE p4.location_id = p2.location_id
            AND p4.is_current = true
            AND p4.is_flagged = false
        )
    )
  ORDER BY p2.location_id, p2.uploaded_at DESC
);

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Auto-flag threshold migration complete' AS status;

-- Show current configuration
SELECT key, value, description 
FROM admin_config 
WHERE key = 'flag_threshold';

-- Show any photos that were auto-flagged during migration
SELECT COUNT(*) as auto_flagged_photos
FROM photos
WHERE is_flagged = true
  AND flag_reason LIKE 'Auto-flagged:%';

-- Show pending review events
SELECT COUNT(*) as pending_reviews
FROM auto_flag_events
WHERE reviewed = false;