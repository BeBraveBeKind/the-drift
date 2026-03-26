import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { getPhotoUrl, timeAgo } from '@/lib/utils'
import { QrCode, Camera, Smartphone, MapPin, ArrowRight } from 'lucide-react'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Switchboard — Viroqua\'s Bulletin Boards, Online',
  description:
    'Browse Viroqua\'s community bulletin boards from your phone. Find local businesses, events, and services. No app, no account, free. Real. Local. Now.',
}

async function getViroquaPreview() {
  // Get Viroqua town
  const { data: town } = await supabase
    .from('towns')
    .select('id, name, slug')
    .eq('slug', 'viroqua')
    .eq('is_active', true)
    .single()

  if (!town) return { town: null, boards: [], totalBoards: 0 }

  // Get total board count
  const { count } = await supabase
    .from('locations')
    .select('*', { count: 'exact', head: true })
    .eq('town_id', town.id)
    .eq('is_active', true)

  // Get recent boards with photos for the preview strip
  const { data: locationsData } = await supabase
    .from('locations')
    .select(`
      id, name, slug, business_category, updated_at,
      photos!inner(id, storage_path, created_at)
    `)
    .eq('is_active', true)
    .eq('town_id', town.id)
    .eq('photos.is_current', true)
    .eq('photos.is_flagged', false)
    .order('updated_at', { ascending: false })
    .limit(6)

  const boards = (locationsData || []).map(location => ({
    id: location.id,
    name: location.name,
    slug: location.slug,
    category: location.business_category,
    photoUrl: getPhotoUrl(location.photos[0].storage_path),
    updatedAt: location.photos[0].created_at,
  }))

  return { town, boards, totalBoards: count || 0 }
}

const FAQ_ITEMS = [
  {
    q: 'Do I need to create an account?',
    a: 'No. Switchboard works without accounts, logins, or personal information. Scan a QR code and browse.',
  },
  {
    q: 'How do listings stay current?',
    a: 'Anyone can update a listing by taking a photo of the bulletin board. Photos are geo-verified — you must be physically at the board. Each listing shows when it was last updated.',
  },
  {
    q: 'Is Switchboard free?',
    a: 'Yes. Browsing is free for community members. Listing on a board is free for businesses.',
  },
  {
    q: 'What if someone posts something inappropriate?',
    a: 'Community members can flag any listing. Flagged content is reviewed and reverted if needed.',
  },
  {
    q: 'How is this different from Facebook or Google?',
    a: 'Switchboard is tied to physical places, not algorithms. No ads, no engagement tricks, no account required. It shows you what\u2019s actually posted on real boards in your town.',
  },
  {
    q: 'How do I get Switchboard in my town?',
    a: 'We work with chambers of commerce, community organizations, and local partners to launch in new towns. Visit the "Start a Town" page to get in touch.',
  },
]

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_ITEMS.map((faq) => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a,
    },
  })),
}

export default async function HomePage() {
  const { town, boards, totalBoards } = await getViroquaPreview()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Navigation />
      <main className="min-h-screen">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="text-center pt-16 pb-12 sm:pt-24 sm:pb-16">
          <div className="max-w-[640px] mx-auto px-4">
            <p
              className="text-sm font-semibold tracking-wide uppercase mb-4"
              style={{ color: 'var(--sb-amber)' }}
            >
              Real. Local. Now.
            </p>

            <h1
              className="text-4xl sm:text-5xl font-bold leading-tight mb-6"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Viroqua&rsquo;s bulletin boards, online.
            </h1>

            <p
              className="text-lg sm:text-xl mb-10"
              style={{ color: 'var(--sb-slate)' }}
            >
              {totalBoards} boards. Updated by your neighbors. No app, no account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Link
                href="/viroqua"
                className="btn-primary"
                style={{ gap: '8px', textDecoration: 'none', fontSize: '16px', padding: '14px 32px' }}
              >
                <MapPin size={18} />
                Browse Viroqua
              </Link>
              <a
                href="#how-it-works"
                className="btn-text"
                style={{ gap: '4px', fontSize: '16px', textDecoration: 'none' }}
              >
                How does this work? <span aria-hidden="true">&rarr;</span>
              </a>
            </div>

            <Image
              src="/hero-banner.webp"
              alt="Illustrated community bulletin board with flyers, business cards, and local postings"
              width={640}
              height={280}
              className="w-full h-auto mt-10"
              priority
              style={{ borderRadius: 'var(--sb-radius)' }}
            />
          </div>
        </section>

        {/* ── Live Preview Strip ──────────────────────────────── */}
        {boards.length > 0 && (
          <section
            className="py-12 sm:py-16"
            style={{ background: 'var(--sb-white)' }}
          >
            <div className="max-w-[640px] mx-auto px-4">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--sb-charcoal)' }}
                >
                  Recently updated
                </h2>
                <Link
                  href="/viroqua"
                  className="text-sm font-medium"
                  style={{ color: 'var(--sb-amber)', textDecoration: 'none' }}
                >
                  See all {totalBoards} <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '12px',
                  maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                }}
              >
                {boards.slice(0, 3).map((board) => (
                  <Link
                    key={board.id}
                    href={`/viroqua/${board.slug}`}
                    className="board-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="board-card__image-wrapper">
                      <img
                        src={board.photoUrl}
                        alt={`${board.name} bulletin board`}
                        className="board-card__image"
                        loading="lazy"
                      />
                    </div>
                    <div className="board-card__content">
                      <p className="board-card__title">{board.name}</p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--sb-stone)' }}
                      >
                        Updated {timeAgo(board.updatedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href="/viroqua"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '16px',
                  padding: '14px 24px',
                  background: 'var(--sb-amber)',
                  color: 'var(--sb-charcoal)',
                  borderRadius: 'var(--sb-radius)',
                  fontWeight: 600,
                  fontSize: '15px',
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
              >
                Browse all {totalBoards} boards in Viroqua <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        )}

        {/* ── How It Works ─────────────────────────────────── */}
        <section
          id="how-it-works"
          className="py-16 sm:py-20"
        >
          <div className="max-w-[640px] mx-auto px-4">
            <h2
              className="text-2xl sm:text-3xl font-bold text-center mb-4"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Three steps. Zero friction.
            </h2>
            <p
              className="text-base text-center mb-12"
              style={{ color: 'var(--sb-stone)' }}
            >
              Works with any phone. No download required.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {[
                {
                  icon: <QrCode size={24} />,
                  step: '1',
                  title: 'Scan',
                  desc: 'A QR code on a local bulletin board opens it on your phone.',
                },
                {
                  icon: <Smartphone size={24} />,
                  step: '2',
                  title: 'Browse',
                  desc: 'See every listing as a photo. Filter by category. Check freshness.',
                },
                {
                  icon: <Camera size={24} />,
                  step: '3',
                  title: 'Update',
                  desc: 'Snap a photo to keep the board current. Geo-verified — you must be there.',
                },
              ].map((s) => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--sb-amber)',
                      color: 'var(--sb-charcoal)',
                    }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <h3
                      className="text-base font-semibold mb-1"
                      style={{ color: 'var(--sb-charcoal)' }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--sb-slate)' }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Expansion CTA ──────────────────────────────────── */}
        <section
          className="py-16 sm:py-20"
          style={{ background: 'var(--sb-white)' }}
        >
          <div className="max-w-[640px] mx-auto px-4">
            <div
              className="text-center"
              style={{
                border: '2px dashed var(--sb-warm-gray)',
                borderRadius: 'var(--sb-radius)',
                padding: '32px 24px',
              }}
            >
              <h2
                className="text-xl sm:text-2xl font-bold mb-3"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Want Switchboard in your town?
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: 'var(--sb-stone)', maxWidth: '400px', margin: '0 auto 24px' }}
              >
                We partner with chambers of commerce and local organizations to launch new communities.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Link
                  href="/start-town"
                  className="btn-primary"
                  style={{ gap: '8px', textDecoration: 'none', fontSize: '15px', padding: '12px 28px' }}
                >
                  Start a Town <ArrowRight size={16} />
                </Link>
                <Link
                  href="/get-listed"
                  className="btn-text"
                  style={{ fontSize: '14px', textDecoration: 'none', padding: '8px' }}
                >
                  I&rsquo;m a local business <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section className="py-16 sm:py-20">
          <div className="max-w-[640px] mx-auto px-4">
            <h2
              className="text-2xl sm:text-3xl font-bold text-center mb-10"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Questions
            </h2>

            <dl style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {FAQ_ITEMS.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--sb-white)',
                    borderRadius: 'var(--sb-radius)',
                    border: '1px solid var(--sb-warm-gray)',
                    padding: '20px 24px',
                  }}
                >
                  <dt
                    className="text-base font-semibold"
                    style={{ color: 'var(--sb-charcoal)' }}
                  >
                    {faq.q}
                  </dt>
                  <dd
                    className="text-sm"
                    style={{ color: 'var(--sb-slate)', marginTop: '8px', lineHeight: '1.6' }}
                  >
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="max-w-[640px] mx-auto px-4">
          <Footer />
        </div>
      </main>
    </>
  )
}
