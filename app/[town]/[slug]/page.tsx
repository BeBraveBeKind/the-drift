import { supabase } from '@/lib/supabase'
import { getPhotoUrl } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import BoardImage from '@/components/BoardImage'
import FreshnessIndicator from '@/components/FreshnessIndicator'
import ShareButton from '@/components/ShareButton'
import FlagButton from '@/components/FlagButton'
import ViewTracker from '@/components/ViewTracker'
import BusinessPageProbes from '@/components/BusinessPageProbes'
import PhotoHistory from '@/components/PhotoHistory'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import {
  Phone, Navigation as NavigationIcon, ExternalLink,
  Camera, PhoneOff, MapPinOff, ArrowRight, ChevronRight,
} from 'lucide-react'

export const revalidate = 60

/* ── Data fetching ──────────────────────────────────────────────── */

async function getBoard(townSlug: string, slug: string) {
  const { data: townData } = await supabase
    .from('towns')
    .select('id, name')
    .eq('slug', townSlug)
    .single()

  if (!townData) return null

  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .eq('town_id', townData.id)
    .single()

  if (!location) return null

  const { data: photo } = await supabase
    .from('photos')
    .select('id, storage_path, created_at')
    .eq('location_id', location.id)
    .eq('is_current', true)
    .eq('is_flagged', false)
    .single()

  // Other businesses in same town for "Also on this board"
  const { data: otherLocations } = await supabase
    .from('locations')
    .select('name, slug')
    .eq('town_id', townData.id)
    .neq('id', location.id)
    .eq('is_active', true)
    .order('name')
    .limit(10)

  return {
    location,
    photo,
    townName: townData.name,
    otherLocations: otherLocations || [],
  }
}

/* ── Helpers ────────────────────────────────────────────────────── */

function formatPhotoDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function displayDomain(url: string): string {
  try {
    const hostname = new URL(
      url.startsWith('http') ? url : `https://${url}`
    ).hostname.replace(/^www\./, '')
    return hostname.length > 30 ? hostname.substring(0, 27) + '...' : hostname
  } catch {
    return url.length > 30 ? url.substring(0, 27) + '...' : url
  }
}

function websiteHref(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`
}

/* ── SEO metadata ───────────────────────────────────────────────── */

interface PageProps {
  params: Promise<{ town: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { town, slug } = await params
  const data = await getBoard(town, slug)
  if (!data) return { title: 'Not Found' }

  const { location, photo, townName } = data
  const category = location.business_category || ''
  const address = location.address || ''

  const title = `${location.name} — ${townName} | Switchboard`
  const desc = [
    `${location.name} in ${townName}.`,
    category ? `${category}` : '',
    address ? `at ${address}.` : '',
    'On Switchboard — your community bulletin board.',
  ]
    .filter(Boolean)
    .join(' ')
    .substring(0, 155)

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: `${category}${address ? ` at ${address}` : ''}`,
      type: 'website',
      ...(photo && {
        images: [{ url: getPhotoUrl(photo.storage_path) }],
      }),
    },
  }
}

/* ── Page component ─────────────────────────────────────────────── */

export default async function BoardPage({ params }: PageProps) {
  const { town, slug } = await params
  const data = await getBoard(town, slug)

  if (!data) notFound()

  const { location, photo, townName, otherLocations } = data

  // Future-proof: phone/website may exist in DB but aren't in TS types yet
  const phone = (location as Record<string, unknown>).phone as string | undefined
  const website = (location as Record<string, unknown>).website as string | undefined
  const hasPhone = !!phone
  const hasAddress = !!location.address
  const hasWebsite = !!website

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <ViewTracker locationId={location.id} />
        <BusinessPageProbes businessSlug={location.slug} />

        <div className="max-w-[640px] mx-auto px-4 py-8">

          {/* ── P1: Orient (0-2 seconds) ──────────────────────── */}

          {/* Brand header */}
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
          >
            Switchboard &middot; {townName}
          </p>

          {/* Business name */}
          <h1
            className="text-[28px] sm:text-[32px] font-bold mb-2"
            style={{ color: 'var(--sb-charcoal)' }}
          >
            {location.name}
          </h1>

          {/* Category · Address */}
          {(location.business_category || location.address) && (
            <p
              className="text-base mb-3"
              style={{ color: 'var(--sb-slate)' }}
            >
              {location.business_category}
              {location.business_category && location.address && ' \u00B7 '}
              {location.address}
            </p>
          )}

          {/* Freshness indicator */}
          <div className="mb-8">
            <FreshnessIndicator updatedAt={photo?.created_at} />
          </div>

          {/* ── P2: See (2-5 seconds) ─────────────────────────── */}

          {photo ? (
            <div className="mb-6">
              <BoardImage
                src={getPhotoUrl(photo.storage_path)}
                alt={`${location.name} bulletin board`}
              />
              <p
                className="mt-2 text-sm"
                style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
              >
                Photo taken {formatPhotoDate(photo.created_at)}
              </p>
            </div>
          ) : (
            <div
              className="mb-6 flex flex-col items-center justify-center py-12"
              style={{
                background: 'var(--sb-warm-white)',
                border: '2px dashed var(--sb-warm-gray)',
                borderRadius: 'var(--sb-radius)',
              }}
            >
              <Camera size={48} color="var(--sb-stone)" className="mb-4" />
              <p className="text-base" style={{ color: 'var(--sb-slate)' }}>
                No photo of this listing yet
              </p>
              <p
                className="text-sm"
                style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
              >
                Be the first to add one.
              </p>
            </div>
          )}

          {/* ── P3: Act (5-10 seconds) ────────────────────────── */}

          {/* Call + Directions buttons */}
          {(hasPhone || hasAddress) && (
            <div className="flex gap-3 mb-4">
              {hasPhone && (
                <a
                  href={`tel:${phone}`}
                  data-action="call"
                  className={`${hasAddress ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 py-3 font-semibold text-base no-underline`}
                  style={{
                    background: 'var(--sb-amber)',
                    color: 'var(--sb-charcoal)',
                    minHeight: '48px',
                    borderRadius: '6px',
                  }}
                >
                  <Phone size={18} />
                  Call
                </a>
              )}

              {hasAddress && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(location.address!)}`}
                  data-action="directions"
                  className={`${hasPhone ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 py-3 font-semibold text-base no-underline`}
                  style={{
                    background: 'var(--sb-white)',
                    color: 'var(--sb-charcoal)',
                    border: '1px solid var(--sb-warm-gray)',
                    minHeight: '48px',
                    borderRadius: '6px',
                  }}
                >
                  <NavigationIcon size={18} />
                  Directions
                </a>
              )}
            </div>
          )}

          {/* Missing-info text (only shown when the field could exist) */}
          {!hasPhone && hasAddress && (
            <p
              className="flex items-center gap-2 text-sm mb-4"
              style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
            >
              <PhoneOff size={14} />
              No phone number listed
            </p>
          )}
          {!hasAddress && hasPhone && (
            <p
              className="flex items-center gap-2 text-sm mb-4"
              style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
            >
              <MapPinOff size={14} />
              No address listed
            </p>
          )}
          {!hasPhone && !hasAddress && (
            <div className="mb-4 space-y-1">
              <p
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
              >
                <PhoneOff size={14} />
                No phone number listed
              </p>
              <p
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
              >
                <MapPinOff size={14} />
                No address listed
              </p>
            </div>
          )}

          {/* Website link */}
          {hasWebsite && (
            <div className="mb-4">
              <a
                href={websiteHref(website!)}
                data-action="website"
                className="inline-flex items-center gap-2 text-base hover:underline"
                style={{ color: 'var(--sb-amber)', fontWeight: 400 }}
              >
                {displayDomain(website!)}
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Share + Flag row */}
          <div className="flex items-center gap-6 mb-10">
            <ShareButton town={town} slug={location.slug} name={location.name} />
            {photo && <FlagButton photoId={photo.id} />}
          </div>

          {/* ── P4: Context (10+ seconds) ─────────────────────── */}

          {/* Photo History */}
          <PhotoHistory locationId={location.id} />

          {/* Also on this board */}
          {otherLocations.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Also on this board
              </h2>
              <div>
                {otherLocations.map((loc: { name: string; slug: string }) => (
                  <Link
                    key={loc.slug}
                    href={`/${town}/${loc.slug}`}
                    className="flex items-center justify-between py-3"
                    style={{
                      borderBottom: '1px solid var(--sb-warm-gray)',
                      color: 'var(--sb-slate)',
                      minHeight: '44px',
                      textDecoration: 'none',
                    }}
                  >
                    <span className="text-base">{loc.name}</span>
                    <ChevronRight size={16} color="var(--sb-stone)" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* More in Town */}
          <div className="mb-8">
            <Link
              href={`/${town}`}
              className="inline-flex items-center gap-2 font-semibold text-base"
              style={{
                color: 'var(--sb-amber)',
                textDecoration: 'none',
                minHeight: '44px',
              }}
            >
              More in {townName}
              <ArrowRight size={16} />
            </Link>
          </div>

          <Footer />
        </div>
      </main>
    </>
  )
}
