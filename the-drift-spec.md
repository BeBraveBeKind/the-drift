# The Drift — Project Specification

**Tagline:** "What's posted around here"

A hyperlocal app that documents physical community bulletin boards. Scan a QR code, snap a photo, share what's up.

---

## Concept

Physical bulletin boards at local businesses get a QR code. Scanning lets you upload a photo of the current board. The Drift shows all locations with their most recent photo, when it was taken, and how many people have checked it.

For the Driftless. For places where news travels slow.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend/DB**: Supabase (Postgres + Storage)
- **Styling**: Tailwind CSS
- **Deployment**: Netlify

---

## Supabase Schema

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Locations table
create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  address text,
  description text,
  view_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Photos table
create table photos (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete cascade,
  storage_path text not null,
  is_current boolean default false,
  is_flagged boolean default false,
  flag_count integer default 0,
  created_at timestamptz default now()
);

-- Flags table
create table flags (
  id uuid primary key default uuid_generate_v4(),
  photo_id uuid references photos(id) on delete cascade,
  reason text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_photos_location_current on photos(location_id, is_current);
create index idx_photos_location_created on photos(location_id, created_at desc);

-- Trigger: only one current photo per location
create or replace function set_current_photo()
returns trigger as $$
begin
  if NEW.is_current = true then
    update photos 
    set is_current = false 
    where location_id = NEW.location_id 
    and id != NEW.id;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trigger_set_current_photo
before insert or update on photos
for each row execute function set_current_photo();

-- RLS Policies
alter table locations enable row level security;
alter table photos enable row level security;
alter table flags enable row level security;

create policy "Locations are viewable by everyone" 
on locations for select using (is_active = true);

-- No direct update policy for locations - use RPC only

create policy "Current photos are viewable by everyone" 
on photos for select using (is_current = true and is_flagged = false);

create policy "All photos viewable for history" 
on photos for select using (true);

create policy "Anyone can upload photos" 
on photos for insert with check (true);

create policy "Anyone can flag photos" 
on flags for insert with check (true);

-- RPC function: increment view count (atomic, secure)
create or replace function increment_view_count(loc_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update locations 
  set view_count = view_count + 1 
  where id = loc_id and is_active = true;
end;
$$;

-- RPC function: increment flag count (atomic, secure)
create or replace function increment_flag_count(p_photo_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update photos 
  set flag_count = flag_count + 1 
  where id = p_photo_id;
end;
$$;

-- Grant execute to anon role
grant execute on function increment_view_count(uuid) to anon;
grant execute on function increment_flag_count(uuid) to anon;
```

---

## Storage Setup

Bucket: `board-photos`
- Public: Yes
- Max file size: 10MB
- Allowed types: image/jpeg, image/png, image/webp

```sql
create policy "Public read access"
on storage.objects for select
using (bucket_id = 'board-photos');

create policy "Anyone can upload"
on storage.objects for insert
with check (bucket_id = 'board-photos');
```

---

## Project Structure

```
the-drift/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                # Homepage
│   ├── not-found.tsx           # 404 page
│   ├── [slug]/
│   │   └── page.tsx            # Location view
│   ├── post/
│   │   └── [slug]/
│   │       └── page.tsx        # QR landing — upload
│   └── api/
│       ├── upload/
│       │   └── route.ts
│       ├── flag/
│       │   └── route.ts
│       └── view/
│           └── route.ts        # Increment view count
├── components/
│   ├── ViewTracker.tsx
│   ├── ShareButton.tsx
│   └── FlagButton.tsx
├── lib/
│   ├── supabase.ts
│   ├── types.ts
│   └── utils.ts
├── netlify.toml                # Netlify config
└── .env.local
```

---

## Key Files

### lib/supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### lib/types.ts
```typescript
export interface Location {
  id: string
  name: string
  slug: string
  address: string | null
  description: string | null
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
```

### lib/utils.ts
```typescript
export function getPhotoUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/board-photos/${storagePath}`
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
```

---

### app/layout.tsx
```typescript
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'The Drift',
  description: 'What\'s posted around here',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-stone-900 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
```

### app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### app/not-found.tsx
```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-2">Nothing here</h1>
      <p className="text-stone-500 mb-6">This board doesn't exist or has been removed.</p>
      <Link 
        href="/" 
        className="text-blue-600 hover:underline"
      >
        ← Back to The Drift
      </Link>
    </main>
  )
}
```

---

### app/page.tsx (Homepage)
```typescript
import { supabase } from '@/lib/supabase'
import { getPhotoUrl, timeAgo } from '@/lib/utils'
import Link from 'next/link'

export const revalidate = 60

async function getBoards() {
  // Get active locations
  const { data: locations, error } = await supabase
    .from('locations')
    .select('id, name, slug, view_count, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
  
  if (error || !locations) return []
  
  // Get current photo for each location
  const boardsWithPhotos = await Promise.all(
    locations.map(async (location) => {
      const { data: photo } = await supabase
        .from('photos')
        .select('id, storage_path, created_at')
        .eq('location_id', location.id)
        .eq('is_current', true)
        .eq('is_flagged', false)
        .single()
      
      return { ...location, photo }
    })
  )
  
  return boardsWithPhotos
}

export default async function HomePage() {
  const boards = await getBoards()
  
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">The Drift</h1>
        <p className="text-stone-500 mt-1">What's posted around here</p>
      </header>
      
      {boards.length === 0 ? (
        <p className="text-stone-400">Nothing yet. Check back soon.</p>
      ) : (
        <div className="space-y-6">
          {boards.map((board) => (
            <Link 
              key={board.id}
              href={`/${board.slug}`}
              className="block group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {board.photo ? (
                  <div className="aspect-[3/2] bg-stone-100">
                    <img 
                      src={getPhotoUrl(board.photo.storage_path)}
                      alt={board.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/2] bg-stone-100 flex items-center justify-center">
                    <span className="text-stone-300">No photo yet</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold group-hover:text-blue-600 transition-colors">
                      {board.name}
                    </h2>
                    <span className="text-sm text-stone-400">
                      {board.view_count} {board.view_count === 1 ? 'look' : 'looks'}
                    </span>
                  </div>
                  {board.photo && (
                    <p className="text-sm text-stone-400 mt-1">
                      Updated {timeAgo(board.photo.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      <footer className="mt-16 pt-8 border-t border-stone-200 text-center text-sm text-stone-400">
        <p>For the Driftless. News travels slow.</p>
      </footer>
    </main>
  )
}
```

---

### app/[slug]/page.tsx (Location View)
```typescript
import { supabase } from '@/lib/supabase'
import { getPhotoUrl, timeAgo } from '@/lib/utils'
import { notFound } from 'next/navigation'
import ShareButton from '@/components/ShareButton'
import FlagButton from '@/components/FlagButton'
import ViewTracker from '@/components/ViewTracker'

export const revalidate = 60

async function getBoard(slug: string) {
  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (!location) return null
  
  const { data: photo } = await supabase
    .from('photos')
    .select('*')
    .eq('location_id', location.id)
    .eq('is_current', true)
    .eq('is_flagged', false)
    .single()
  
  return { location, photo }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BoardPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getBoard(slug)
  
  if (!data) notFound()
  
  const { location, photo } = data
  
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <ViewTracker locationId={location.id} />
      
      <nav className="mb-6">
        <a href="/" className="text-sm text-stone-400 hover:text-stone-600">
          ← The Drift
        </a>
      </nav>
      
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{location.name}</h1>
        {location.address && (
          <p className="text-stone-500 text-sm mt-1">{location.address}</p>
        )}
      </header>
      
      {photo ? (
        <div>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <img 
              src={getPhotoUrl(photo.storage_path)}
              alt={`${location.name} bulletin board`}
              className="w-full"
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-stone-400">
              Updated {timeAgo(photo.created_at)} · {location.view_count} looks
            </span>
            <div className="flex items-center gap-4">
              <ShareButton slug={location.slug} name={location.name} />
              <FlagButton photoId={photo.id} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-stone-100 rounded-lg p-12 text-center">
          <p className="text-stone-400">No photo yet</p>
          <p className="text-sm text-stone-300 mt-1">
            Be the first to share what's posted
          </p>
        </div>
      )}
    </main>
  )
}
```

---

### app/post/[slug]/page.tsx (QR Landing / Upload)
```typescript
'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function PostPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slug', slug)
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }
      
      setDone(true)
      setTimeout(() => router.push(`/${slug}`), 1500)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }
  
  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
        <div className="text-center">
          <div className="text-4xl mb-3">📌</div>
          <p className="text-xl font-medium">Posted to The Drift</p>
        </div>
      </main>
    )
  }
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
      <div className="max-w-xs w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Post to The Drift</h1>
        <p className="text-stone-500 mb-8">
          Pinning something? Snap a photo so others can see what's up.
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full py-4 px-6 bg-stone-900 text-white font-medium rounded-lg 
                     hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : '📷 Take Photo'}
        </button>
        
        {error && (
          <p className="mt-4 text-red-600 text-sm">{error}</p>
        )}
        
        <p className="mt-8 text-xs text-stone-400">
          Your photo will be public on The Drift
        </p>
      </div>
    </main>
  )
}
```

---

### components/ViewTracker.tsx
```typescript
'use client'

import { useEffect } from 'react'

export default function ViewTracker({ locationId }: { locationId: string }) {
  useEffect(() => {
    // Fire and forget - don't block render
    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId })
    }).catch(() => {}) // Silently fail
  }, [locationId])
  
  return null
}
```

---

### components/ShareButton.tsx
```typescript
'use client'

import { useState } from 'react'

export default function ShareButton({ slug, name }: { slug: string, name: string }) {
  const [copied, setCopied] = useState(false)
  
  async function handleShare() {
    const url = `${window.location.origin}/${slug}`
    
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} — The Drift`,
          url
        })
        return
      } catch {
        // User cancelled or not supported
      }
    }
    
    // Fallback to clipboard
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button
      onClick={handleShare}
      className="text-stone-400 hover:text-stone-600 text-sm"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
```

---

### components/FlagButton.tsx
```typescript
'use client'

import { useState } from 'react'

export default function FlagButton({ photoId }: { photoId: string }) {
  const [flagged, setFlagged] = useState(false)
  const [loading, setLoading] = useState(false)
  
  async function handleFlag() {
    if (flagged || loading) return
    
    setLoading(true)
    
    try {
      await fetch('/api/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      })
      setFlagged(true)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button
      onClick={handleFlag}
      disabled={flagged || loading}
      className="text-stone-300 hover:text-red-400 text-sm disabled:cursor-default"
    >
      {flagged ? 'Flagged' : 'Flag'}
    </button>
  )
}
```

---

### app/api/upload/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const slug = formData.get('slug') as string
    
    if (!file || !slug) {
      return NextResponse.json({ error: 'Missing file or location' }, { status: 400 })
    }
    
    // Get location
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }
    
    // Upload
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'jpg'
    const storagePath = `${location.id}/${timestamp}.${ext}`
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('board-photos')
      .upload(storagePath, file, { contentType: file.type })
    
    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
    
    // Create record + set current
    await supabaseAdmin
      .from('photos')
      .insert({
        location_id: location.id,
        storage_path: storagePath,
        is_current: true
      })
    
    // Update location timestamp
    await supabaseAdmin
      .from('locations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', location.id)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

### app/api/view/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { locationId } = await request.json()
    
    if (!locationId) {
      return NextResponse.json({ error: 'Missing location' }, { status: 400 })
    }
    
    // Use RPC for atomic increment (runs as security definer)
    const { error } = await supabase.rpc('increment_view_count', { loc_id: locationId })
    
    if (error) {
      console.error('View increment error:', error)
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

### app/api/flag/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { photoId } = await request.json()
    
    if (!photoId) {
      return NextResponse.json({ error: 'Missing photo' }, { status: 400 })
    }
    
    // Insert flag record (RLS allows anon insert)
    const { error: flagError } = await supabase
      .from('flags')
      .insert({ photo_id: photoId })
    
    if (flagError) {
      console.error('Flag insert error:', flagError)
    }
    
    // Increment flag count via RPC
    await supabase.rpc('increment_flag_count', { p_photo_id: photoId })
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

## Netlify Config

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

---

## QR Sign Template

```
┌────────────────────────────────┐
│                                │
│   Pinning something new?       │
│   Snap a photo for The Drift.  │
│                                │
│          [QR CODE]             │
│                                │
│        thedrift.town           │
│                                │
└────────────────────────────────┘
```

---

## Pilot Locations

| Name | Slug | Address |
|------|------|---------|
| Viroqua Food Co-op | viroqua-coop | 609 Main St |
| Kickapoo Coffee | kickapoo-coffee | 220 S Main St |
| Driftless Cafe | driftless-cafe | 118 W Court St |

---

## Success Signals (2-week pilot)

**Working:**
- ≥1 submission per location
- View counts climbing (people are looking)
- Anyone shares unprompted
- A location owner asks about a second board

**Not working:**
- QR codes up but 0 submissions
- Views but no submissions (interest but friction too high)
- Submissions but 0 views (no pull to the site)

---

## What's Intentionally Missing

- Admin UI (use Supabase dashboard)
- Auth
- Email notifications
- Analytics beyond view counts
- EXIF stripping (small town, low risk)
- Auto-hide on flags (manual review for pilot)

Ship fast. See if anyone cares.
