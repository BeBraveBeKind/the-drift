import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import TownContent from '@/components/TownContent'
import SteveCTA from '@/components/SteveCTA'
import Footer from '@/components/Footer'
import type { LocationWithPhoto } from '@/types'
import { generateTownMetadata, generateTownStructuredData } from './metadata'

export const revalidate = 60

/* ── Data fetching ──────────────────────────────────────────────── */

async function getTownBoards(townSlug: string) {
  const { data: townData, error: townError } = await supabase
    .from('towns')
    .select('id, name, slug')
    .eq('slug', townSlug)
    .eq('is_active', true)
    .single()

  if (townError || !townData) return null

  // Get locations with current photos
  const { data: locationsData } = await supabase
    .from('locations')
    .select(`
      id, name, slug, address, town, town_id, view_count, updated_at,
      business_category, business_tags, profile_completed, latitude, longitude,
      photos!inner(id, storage_path, created_at)
    `)
    .eq('is_active', true)
    .eq('town_id', townData.id)
    .eq('photos.is_current', true)
    .eq('photos.is_flagged', false)
    .order('updated_at', { ascending: false })

  // Get locations without photos
  const { data: locationsWithoutPhotos } = await supabase
    .from('locations')
    .select('id, name, slug, address, town, town_id, view_count, updated_at, business_category, business_tags, profile_completed, latitude, longitude')
    .eq('is_active', true)
    .eq('town_id', townData.id)
    .not('id', 'in', `(${(locationsData || []).map(l => l.id).join(',') || 'null'})`)
    .order('updated_at', { ascending: false })

  // Combine and sort by freshness
  const withPhotos = (locationsData || []).map(location => ({
    ...location,
    photo: location.photos[0] || null,
  }))

  const withoutPhotos = (locationsWithoutPhotos || []).map(location => ({
    ...location,
    photo: null,
  }))

  const boards = [...withPhotos, ...withoutPhotos].sort((a, b) => {
    const dateA = a.photo ? new Date(a.photo.created_at).getTime() : new Date(a.updated_at).getTime()
    const dateB = b.photo ? new Date(b.photo.created_at).getTime() : new Date(b.updated_at).getTime()
    return dateB - dateA
  }) as LocationWithPhoto[]

  return { town: townData, boards }
}

/* ── SEO metadata ───────────────────────────────────────────────── */

interface PageProps {
  params: Promise<{ town: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { town } = await params
  const data = await getTownBoards(town)
  if (!data) return { title: 'Not Found' }

  const title = `${data.town.name} Community Bulletin Boards`
  const desc = `Browse ${data.boards.length} community bulletin boards in ${data.town.name}. See local events, businesses, and services posted on real boards — updated by your neighbors. No app, no account.`
  const geoMeta = generateTownMetadata(town)

  return {
    title,
    description: desc,
    keywords: geoMeta.keywords,
    alternates: { canonical: `https://switchboard.town/${town}` },
    openGraph: { title, description: desc, type: 'website' },
    other: geoMeta.other as Record<string, string>,
  }
}

/* ── Page component ─────────────────────────────────────────────── */

export default async function TownHomePage({ params }: PageProps) {
  const { town } = await params
  const data = await getTownBoards(town)

  if (!data) notFound()

  const { town: townData, boards } = data
  const townStructuredData = generateTownStructuredData(town)

  return (
    <>
      {townStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(townStructuredData) }}
        />
      )}
      <Navigation />
      <main className="min-h-screen">
        {/* Hero banner — server-rendered */}
        <header className="max-w-[640px] mx-auto px-4 pt-4 pb-2">
          <div
            className="flex flex-col items-center justify-center text-center px-6"
            style={{
              backgroundImage: 'linear-gradient(rgba(30,41,59,0.45), rgba(30,41,59,0.45)), url(/hero-banner.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 'var(--sb-radius)',
              minHeight: '200px',
            }}
          >
            <p
              className="text-sm sm:text-base uppercase tracking-widest mb-1"
              style={{ color: '#F59E0B', letterSpacing: '0.15em', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              Switchboard
            </p>
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1"
              style={{ color: '#ffffff', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
            >
              {townData.name} Bulletin Boards
            </h1>
            <p
              className="text-sm sm:text-base font-light"
              style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              See what&rsquo;s posted in your community
            </p>
          </div>
        </header>

        {/* Interactive content — client island */}
        <TownContent
          boards={boards}
          townSlug={town}
          townName={townData.name}
        />

        <div className="max-w-[640px] mx-auto px-4">
          <SteveCTA />
        </div>

        <div className="max-w-[640px] mx-auto px-4">
          <Footer />
        </div>
      </main>
    </>
  )
}
