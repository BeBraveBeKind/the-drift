-- Migration 004: Business Profiles for Discovery System
-- Adds business category and content tags to locations for filtering and discovery

-- Add business profile fields to locations table
ALTER TABLE locations 
ADD COLUMN business_category TEXT,
ADD COLUMN business_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN profile_completed_at TIMESTAMPTZ;

-- Create index for business category filtering
CREATE INDEX idx_locations_business_category ON locations (business_category);

-- Create GIN index for business tags array searches
CREATE INDEX idx_locations_business_tags ON locations USING GIN (business_tags);

-- Create index for profile completion status (for admin dashboard)
CREATE INDEX idx_locations_profile_completed ON locations (profile_completed);

-- Update existing locations to have profile_completed = false
UPDATE locations SET profile_completed = false WHERE profile_completed IS NULL;

-- Create a partial index for active locations with categories (faster filtering)
CREATE INDEX idx_locations_active_category ON locations (business_category) 
WHERE is_active = true;

-- Add constraint to ensure business_category is one of the allowed values
ALTER TABLE locations 
ADD CONSTRAINT valid_business_category 
CHECK (
  business_category IS NULL OR 
  business_category IN (
    'cafe',
    'restaurant', 
    'co-op',
    'grocery',
    'laundromat',
    'library',
    'community-center',
    'shop',
    'salon',
    'gym',
    'church',
    'school',
    'office',
    'other'
  )
);

-- Function to update profile_completed_at when profile_completed changes
CREATE OR REPLACE FUNCTION update_profile_completed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_completed = true AND (OLD.profile_completed IS NULL OR OLD.profile_completed = false) THEN
    NEW.profile_completed_at = NOW();
  ELSIF NEW.profile_completed = false THEN
    NEW.profile_completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update profile_completed_at
CREATE TRIGGER trigger_update_profile_completed_timestamp
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completed_timestamp();

-- Grant permissions for the web app to use these new fields
-- (Assuming you have a specific user/role for your app)
-- GRANT SELECT, UPDATE ON locations TO your_app_user;