# Deployment Checklist for Switchboard

## Required Environment Variables in Netlify

Make sure these are set in Netlify Dashboard → Site Settings → Environment Variables:

### Critical for Upload Feature:
- `SUPABASE_SERVICE_ROLE_KEY` - **REQUIRED FOR UPLOADS**
  - Get from: Supabase Dashboard → Settings → API → Service Role Key
  - This is different from the anon key!
  - Keep this secret, never commit to code

### Public Variables (already in code):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### Optional:
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics ID (if using)

## How to Add in Netlify:

1. Go to Netlify Dashboard
2. Select your site (switchboard.town)
3. Go to Site Settings → Environment Variables
4. Click "Add a variable"
5. Add each variable with its value
6. **Important**: Deploy/redeploy after adding variables

## Verify Environment Variables are Set:

Visit: `/admin/test` after deployment to check if all services are configured correctly.

## Database Setup:

Run these SQL scripts in Supabase SQL Editor (in order):
1. `fix-admin-complete-v2.sql` - Sets up admin functions
2. `fix-viroqua-town.sql` - Ensures Viroqua town exists
3. `check-database-state.sql` - Verify everything is working

## Testing Upload:

1. Visit a business page (e.g., `/viroqua/driftless-books`)
2. Click "Upload Photo"
3. Select an image
4. Should upload successfully

## Common Issues:

### "Network error" on upload:
- Missing `SUPABASE_SERVICE_ROLE_KEY` in Netlify
- Need to redeploy after adding environment variable

### "Town not found":
- Run `fix-viroqua-town.sql` in Supabase

### "Location not found":
- Check that the location exists and is active in database

## Support:

If issues persist, check:
- Browser console for errors
- Netlify function logs
- Supabase logs