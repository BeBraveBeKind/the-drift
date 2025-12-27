# The Drift - Database Setup Instructions

## Important: If Locations are Missing or "Add Location" Doesn't Work

This means the database RPC functions haven't been set up yet. Follow these steps:

### 1. Run the Admin Functions in Supabase SQL Editor

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `admin-functions.sql`
4. Click "Run"

### 2. Add All Viroqua Locations

1. In the SQL Editor, paste the contents of `add-all-locations.sql`
2. Click "Run"

This will add all Viroqua locations including:
- Noble Rind (105 S Main St)
- Maybe Lately's (117 N Main St)
- Kwik Trip North (1301 N Main St)  
- Kwik Trip South (603 S Main St)
- Viroqua Food Co+op (609 Main St)
- County Seat Laundry (124 S Main St)
- Nelson's AgriCenter (126 N Main St)
- Driftless Cafe (118 W Court St)
- Magie's (116 S Main St)
- Driftless Books (108 S Main St)

### 3. Verify Setup

1. Go to `/admin` in your app
2. Password: `drift2024`
3. You should see all locations listed
4. The "Add Location" button should now work

## Troubleshooting

### "Add Location" Still Not Working?
- Check browser console for errors
- The improved error handling will now show alert messages with specific errors
- Make sure the RPC functions were created (check Supabase Dashboard > Database > Functions)

### Need to Add Noble Rind Manually?
If you just need to add Noble Rind quickly:

```sql
INSERT INTO locations (name, slug, address, description, is_active)
VALUES ('Noble Rind', 'noble-rind', '105 S Main St', 'Board near entrance', true);
```

### Missing Other Locations?
Check `add-all-locations.sql` for the complete list of Viroqua businesses.

## Admin Panel Features

Now with the fixed admin panel, you can:
- ✅ Add new locations with the "Add Location" button
- ✅ Edit existing locations
- ✅ Toggle location active status
- ✅ Generate QR codes for each location
- ✅ **Upload photos directly** without visiting the location
- ✅ See clear error messages if something goes wrong

## Uploading Photos as Admin

1. Click "Upload Photo" next to any location
2. Select your photo file
3. Wait for "Uploading..." to complete
4. Photo will be set as the current photo for that location

No QR code scanning required!