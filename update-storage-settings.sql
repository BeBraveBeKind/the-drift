-- Run this in Supabase SQL Editor to update storage settings
-- This ensures the board-photos bucket can handle larger files

-- Update the bucket configuration for larger files
UPDATE storage.buckets 
SET 
  file_size_limit = 10485760, -- 10MB limit
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
WHERE name = 'board-photos';

-- Ensure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'board-photos';

-- Check current settings
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'board-photos';