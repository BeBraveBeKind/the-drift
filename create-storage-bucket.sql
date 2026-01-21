-- Create Storage Bucket for Board Photos
-- Run this in Supabase SQL Editor

-- Note: Storage buckets can't be created via SQL directly
-- You need to create them in the Supabase Dashboard

-- However, we can set up the policies once the bucket exists
-- First, create the bucket manually:
/*
1. Go to Supabase Dashboard
2. Navigate to Storage
3. Click "New Bucket"
4. Name: board-photos
5. Public bucket: YES (check this box)
6. Click "Create Bucket"
*/

-- After creating the bucket, run these policies:

-- Allow public viewing of all photos
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'board-photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'board-photos' 
  AND auth.role() = 'authenticated'
);

-- Allow service role to do everything (for API uploads)
CREATE POLICY "Service role can manage all" ON storage.objects
FOR ALL USING (
  bucket_id = 'board-photos' 
  AND auth.role() = 'service_role'
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE WITH CHECK (
  bucket_id = 'board-photos' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'board-photos' 
  AND auth.role() = 'authenticated'
);