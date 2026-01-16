# Switchboard Improvement Plan

A comprehensive work plan for implementing architectural improvements based on how the project scope has evolved from single-town MVP to multi-town platform.

---

## Priority 1: Critical (Must Fix Before Scaling)

### 1.1 Fix Slug Uniqueness Constraint

**Problem:** Slug is globally unique, blocking multi-town scaling (can't have "coffee-shop" in two towns).

**Files to modify:**
- `schema.sql`
- Create new migration file

**Steps:**
1. Create `migration-slug-unique-per-town.sql`:
   ```sql
   -- Drop existing unique constraint on slug
   ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_slug_key;

   -- Add composite unique constraint
   ALTER TABLE locations ADD CONSTRAINT locations_slug_town_unique UNIQUE(slug, town);
   ```
2. Test migration on a backup/staging database first
3. Update any code that assumes global slug uniqueness (should be minimal since queries already filter by town)

**Verification:** Try inserting two locations with same slug but different towns.

---

### 1.2 Replace Client-Side Admin Authentication

**Problem:** Password stored in `NEXT_PUBLIC_ADMIN_PASSWORD`, checked client-side only, fallback to `'admin123'`.

**Files to modify:**
- `app/admin/page.tsx`
- `lib/supabase.ts`
- Environment variables

**Steps:**
1. Set up Supabase Auth (already available in your Supabase project)
2. Create admin user(s) in Supabase Auth dashboard
3. Create `lib/auth.ts` with auth helpers:
   ```typescript
   import { createClient } from '@/lib/supabase'

   export async function signIn(email: string, password: string) {
     const supabase = createClient()
     return supabase.auth.signInWithPassword({ email, password })
   }

   export async function signOut() {
     const supabase = createClient()
     return supabase.auth.signOut()
   }

   export async function getSession() {
     const supabase = createClient()
     return supabase.auth.getSession()
   }
   ```
4. Create `app/admin/login/page.tsx` - dedicated login page
5. Update `app/admin/page.tsx`:
   - Remove `NEXT_PUBLIC_ADMIN_PASSWORD` check
   - Use `getSession()` to verify authentication
   - Redirect to login if not authenticated
6. Add RLS policy for admin operations based on auth
7. Remove `NEXT_PUBLIC_ADMIN_PASSWORD` from environment

**Verification:** Cannot access `/admin` without logging in. Cannot bypass via browser console.

---

## Priority 2: High (Significant Impact)

### 2.1 Dynamic Town Management

**Problem:** Town hardcoded as `'viroqua'` throughout. Cannot add new towns without code changes.

**Files to modify:**
- Create `migration-add-towns-table.sql`
- `app/admin/page.tsx`
- `app/page.tsx`
- `lib/types.ts`

**Steps:**
1. Create towns table:
   ```sql
   CREATE TABLE towns (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name text NOT NULL,
     slug text UNIQUE NOT NULL,
     is_active boolean DEFAULT true,
     created_at timestamptz DEFAULT now()
   );

   -- Seed with existing town
   INSERT INTO towns (name, slug) VALUES ('Viroqua', 'viroqua');

   -- Add foreign key to locations
   ALTER TABLE locations
     ADD COLUMN town_id uuid REFERENCES towns(id);

   -- Backfill existing locations
   UPDATE locations SET town_id = (SELECT id FROM towns WHERE slug = 'viroqua');
   ```
2. Add Town type to `lib/types.ts`
3. Update admin panel:
   - Fetch towns dynamically for dropdown
   - Add town management section (CRUD for towns)
4. Update landing page to show town selector if multiple towns exist
5. Remove hardcoded `'viroqua'` references

**Verification:** Can add a new town via admin panel and create locations in it.

---

### 2.2 Image Optimization - Next.js Image Component

**Problem:** Using raw `<img>` tags with no optimization. Large images slow page loads.

**Files to modify:**
- `next.config.ts`
- `app/[town]/page.tsx`
- `app/[town]/[slug]/page.tsx`
- `app/page-old.tsx` (if keeping)

**Steps:**
1. Update `next.config.ts`:
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     images: {
       remotePatterns: [
         {
           protocol: 'https',
           hostname: '*.supabase.co',
           pathname: '/storage/v1/object/public/**',
         },
       ],
     },
   };

   export default nextConfig;
   ```
2. Replace `<img>` tags with Next.js `<Image>`:
   - `app/[town]/page.tsx` lines 247-248, 318-319 (grid thumbnails)
   - `app/[town]/[slug]/page.tsx` lines 71-72 (detail view)
3. Add appropriate `sizes` prop for responsive behavior:
   ```tsx
   <Image
     src={getPhotoUrl(photo.storage_path)}
     alt={`${location.name} bulletin board`}
     width={400}
     height={300}
     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
     className="..."
   />
   ```
4. For detail page, use larger dimensions or `fill` with container

**Verification:** Check Network tab - images served as WebP, multiple sizes in srcset.

---

### 2.3 Image Optimization - Upload Compression

**Problem:** Phone photos can be 5MB+. Wastes storage and bandwidth.

**Files to create/modify:**
- Create `lib/imageCompression.ts`
- `app/api/upload/route.ts`
- `app/admin/page.tsx` (admin upload)
- `app/post/[town]/[slug]/page.tsx`

**Steps:**
1. Create `lib/imageCompression.ts`:
   ```typescript
   export async function compressImage(
     file: File,
     maxWidth = 1600,
     quality = 0.85
   ): Promise<Blob> {
     return new Promise((resolve, reject) => {
       const img = new window.Image()
       img.onload = () => {
         const canvas = document.createElement('canvas')
         const ratio = Math.min(maxWidth / img.width, 1)
         canvas.width = img.width * ratio
         canvas.height = img.height * ratio

         const ctx = canvas.getContext('2d')
         if (!ctx) {
           reject(new Error('Failed to get canvas context'))
           return
         }
         ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

         canvas.toBlob(
           (blob) => {
             if (blob) resolve(blob)
             else reject(new Error('Failed to compress image'))
           },
           'image/jpeg',
           quality
         )
       }
       img.onerror = () => reject(new Error('Failed to load image'))
       img.src = URL.createObjectURL(file)
     })
   }
   ```
2. Update upload components to compress before sending:
   ```typescript
   const compressed = await compressImage(file)
   const formData = new FormData()
   formData.append('photo', compressed, 'photo.jpg')
   ```
3. Update API route to handle compressed uploads

**Verification:** Upload a 5MB photo, check Supabase Storage - should be ~200-400KB.

---

## Priority 3: Medium (Code Quality)

### 3.1 Break Up Admin Component

**Problem:** `app/admin/page.tsx` is 630+ lines with mixed concerns.

**Files to create:**
- `components/admin/LocationsTable.tsx`
- `components/admin/LocationForm.tsx`
- `components/admin/PhotoUploader.tsx`
- `components/admin/TownSelector.tsx`
- `hooks/useLocations.ts`
- `hooks/usePhotoUpload.ts`

**Steps:**
1. Extract `LocationsTable` component (display, edit, delete actions)
2. Extract `LocationForm` component (create/edit form)
3. Extract `PhotoUploader` component (file selection, preview, upload)
4. Create `useLocations` hook for data fetching and mutations
5. Create `usePhotoUpload` hook for upload logic
6. Refactor `app/admin/page.tsx` to compose these components
7. Consider using React Hook Form for form management

**Target:** Admin page should be <150 lines, orchestrating components.

---

### 3.2 Fix N+1 Query Problem

**Problem:** Town page loads locations, then makes separate query for each photo.

**File to modify:**
- `app/[town]/page.tsx`

**Current code (lines ~70-85):**
```typescript
// Fetches locations, then loops to fetch each photo
const locationsWithPhotos = await Promise.all(
  locations.map(async (location) => {
    const { data: photos } = await supabase
      .from('photos')
      .select('id, storage_path, created_at')
      // ...
  })
)
```

**Steps:**
1. Create a database view or use a join:
   ```sql
   CREATE VIEW locations_with_current_photo AS
   SELECT
     l.*,
     p.id as photo_id,
     p.storage_path as photo_storage_path,
     p.created_at as photo_created_at
   FROM locations l
   LEFT JOIN photos p ON p.location_id = l.id AND p.is_current = true
   WHERE l.is_active = true;
   ```
2. Or use Supabase's nested select:
   ```typescript
   const { data } = await supabase
     .from('locations')
     .select(`
       *,
       photos!inner(id, storage_path, created_at)
     `)
     .eq('town', town)
     .eq('is_active', true)
     .eq('photos.is_current', true)
   ```
3. Update the page to use single query

**Verification:** Network tab shows 1 request instead of N+1.

---

### 3.3 Centralize Type Definitions

**Problem:** Types scattered across files, `Location` type missing `town` field.

**File to modify:**
- `lib/types.ts`

**Steps:**
1. Define all shared types:
   ```typescript
   export interface Town {
     id: string
     name: string
     slug: string
     is_active: boolean
     created_at: string
   }

   export interface Location {
     id: string
     name: string
     slug: string
     town: string
     town_id?: string
     address: string
     description: string
     view_count: number
     is_active: boolean
     created_at: string
     updated_at: string
   }

   export interface Photo {
     id: string
     location_id: string
     storage_path: string
     is_current: boolean
     is_flagged: boolean
     flag_count: number
     created_at: string
   }

   export interface LocationWithPhoto extends Location {
     photo: Photo | null
   }
   ```
2. Update all files to import from `lib/types.ts`
3. Remove inline interface definitions

---

### 3.4 Consistent Styling

**Problem:** Detail pages use stone/slate colors while rest uses cork board aesthetic.

**Files to modify:**
- `app/[town]/[slug]/page.tsx`
- Consider creating `lib/theme.ts`

**Steps:**
1. Create theme constants:
   ```typescript
   // lib/theme.ts
   export const colors = {
     cork: '#C4A574',
     corkLight: '#D4B584',
     corkDark: '#A68B5B',
     paper: '#FFF8E7',
     text: '#5D4E37',
   }

   export const pushpinColors = [
     '#DC2626', '#2563EB', '#16A34A', '#CA8A04', '#9333EA'
   ]
   ```
2. Update detail page to use cork board aesthetic
3. Replace hardcoded hex values with theme constants

---

## Priority 4: Lower (Nice to Have)

### 4.1 Add Basic Tests

**Files to create:**
- `__tests__/lib/utils.test.ts`
- `__tests__/components/FlagButton.test.tsx`
- `cypress/e2e/upload.cy.ts` (or Playwright equivalent)

**Steps:**
1. Install testing dependencies:
   ```bash
   npm install -D jest @testing-library/react @testing-library/jest-dom
   ```
2. Add unit tests for utility functions
3. Add component tests for interactive elements
4. Add E2E test for critical upload flow

---

### 4.2 Add Analytics Dashboard

**Problem:** Tracking `view_count` but no UI to see it.

**Files to create:**
- `app/admin/analytics/page.tsx`

**Steps:**
1. Create analytics page showing:
   - Most viewed boards
   - Views over time (if tracking timestamps)
   - Flagged content summary
2. Add link from admin dashboard

---

### 4.3 Cleanup Migration Files

**Problem:** Multiple SQL files in root, some are superseded.

**Steps:**
1. Create `migrations/` folder
2. Move and rename SQL files with timestamps:
   ```
   migrations/
     001_initial_schema.sql
     002_add_town.sql
     003_slug_unique_per_town.sql
     004_towns_table.sql
   ```
3. Delete superseded/debug files:
   - `admin-functions.sql` (superseded by `update-admin-functions.sql`)
   - `debug-*.sql` files
   - `fix-*.sql` files (one-time fixes)
   - `route-temporary-fix.ts`
   - `app/page-old.tsx`

---

### 4.4 Add Rate Limiting

**Files to modify:**
- `app/api/upload/route.ts`
- `app/api/flag/route.ts`

**Steps:**
1. Install rate limiting package or use Vercel/Netlify edge config
2. Add rate limits:
   - Upload: 5 per minute per IP
   - Flag: 10 per minute per IP

---

## Implementation Order

Recommended sequence respecting dependencies:

```
Week 1: Critical fixes
├── 1.1 Slug uniqueness (database)
└── 1.2 Admin authentication (security)

Week 2: Multi-tenancy foundation
└── 2.1 Dynamic town management

Week 3: Performance
├── 2.2 Next.js Image component
└── 2.3 Upload compression

Week 4: Code quality
├── 3.1 Break up admin component
├── 3.2 Fix N+1 queries
└── 3.3 Centralize types

Week 5: Polish
├── 3.4 Consistent styling
├── 4.3 Cleanup migration files
└── 4.1 Add basic tests (ongoing)
```

---

## Notes

- Always test database migrations on a staging environment first
- Create database backups before running migrations
- The auth change (1.2) will require updating environment variables in Netlify
- Image optimization (2.2, 2.3) can be done incrementally, page by page
