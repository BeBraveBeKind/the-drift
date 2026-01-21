# 🚨 URGENT: Create Storage Bucket

The storage bucket `board-photos` is missing! This is why uploads are failing.

## Quick Fix (Do This Now):

### Step 1: Create the Bucket
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Storage** (left sidebar)
4. Click **"New Bucket"** button
5. Settings:
   - Name: `board-photos` (exactly this, lowercase)
   - Public bucket: **✅ YES** (check this box - IMPORTANT!)
   - File size limit: 10MB (or higher if you want)
   - Allowed MIME types: `image/*` (or leave blank for all)
6. Click **"Create Bucket"**

### Step 2: Set Permissions (Optional - for extra security)
After creating the bucket, you can run the SQL in `create-storage-bucket.sql` to set up proper policies.

### Step 3: Test
1. Go to your admin panel
2. Try uploading a photo
3. Should work now!

## Why This Happened:
Storage buckets aren't created automatically - they need to be manually set up in Supabase.

## Alternative: Use Supabase CLI
If you have Supabase CLI:
```bash
supabase storage create board-photos --public
```

That's it! After creating the bucket, uploads will work immediately.