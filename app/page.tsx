import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { MapPin, ChevronRight, QrCode, Camera, Shield, Flag, Smartphone } from 'lucide-react'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Switchboard — Your Town\'s Bulletin Boards, Online',
  description:
    'Scan a QR code to browse your local bulletin board from your phone. Find businesses, events, and services. No app, no account, free. Real. Local. Now.',
}

async function getTowns() {
  const { data: towns } = await supabase
    .from('towns')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  if (!towns || towns.length === 0) return []

  const townsWithCounts = await Promise.all(
    towns.map(async (town) => {
      const { count } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('town_id', town.id)
        .eq('is_active', true)

      return {
        name: town.name.charAt(0).toUpperCase() + town.name.slice(1),
        slug: town.slug,
        boardCount: count || 0,
      }
    })
  )

  return townsWithCounts
}

export default async function HomePage() {
  const towns = await getTowns()
  const totalBoards = towns.reduce((sum, t) => sum + t.boardCount, 0)

  return (
    <>
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
              Your town&rsquo;s bulletin boards, online.
            </h1>

            <p
              className="text-lg sm:text-xl mb-10"
              style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
            >
              Switchboard turns physical bulletin boards into live, browsable pages.
              Scan a QR code to see what&rsquo;s posted. No app. No account. Just your community.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#towns"
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-base no-underline"
                style={{
                  background: 'var(--sb-amber)',
                  color: 'var(--sb-charcoal)',
                  borderRadius: '6px',
                  minHeight: '48px',
                }}
              >
                Find my town
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1 text-base font-semibold no-underline"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                See how it works <span aria-hidden="true">&rarr;</span>
              </a>
            </div>

            <p
              className="text-sm mt-4 mb-10"
              style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
            >
              Free for everyone. Always.
            </p>

            <Image
              src="/hero-banner.webp"
              alt="Illustrated community bulletin board with flyers, business cards, and local postings"
              width={640}
              height={280}
              className="w-full h-auto"
              priority
              style={{ borderRadius: 'var(--sb-radius)' }}
            />

            {/* Aggregate stats */}
            <div
              className="flex justify-center gap-10 mt-8 pt-6"
              style={{ borderTop: '1px solid var(--sb-warm-gray)' }}
            >
              <div className="text-center">
                <p
                  className="text-2xl font-bold"
                  style={{ color: 'var(--sb-charcoal)' }}
                >
                  {totalBoards}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
                >
                  bulletin boards
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-2xl font-bold"
                  style={{ color: 'var(--sb-charcoal)' }}
                >
                  {towns.length}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
                >
                  {towns.length === 1 ? 'community' : 'communities'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section
          id="how-it-works"
          className="py-16 sm:py-20"
          style={{ background: 'var(--sb-warm-white)' }}
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

            <div className="grid grid-cols-1 gap-10 sm:gap-12">
              {[
                {
                  icon: <QrCode size={28} />,
                  step: '1',
                  title: 'Scan',
                  desc: 'A QR code on a local bulletin board opens it on your phone. Library, co-op, coffee shop — wherever boards already exist.',
                  image: '/instructional/IMG_2404.jpg',
                  imageAlt: 'Person scanning a Switchboard QR code at a bulletin board with their phone',
                },
                {
                  icon: <Smartphone size={28} />,
                  step: '2',
                  title: 'Browse',
                  desc: 'See every listing as a photo. Filter by category. Check when it was last updated. Find what you need in seconds.',
                  image: '/instructional/IMG_2408.jpg',
                  imageAlt: 'Phone showing the Switchboard business page after scanning a QR code',
                },
                {
                  icon: <Camera size={28} />,
                  step: '3',
                  title: 'Update',
                  desc: 'Snap a photo of the board to keep it current. Geo-verified — you must be there in person. The community keeps it real.',
                  image: '/instructional/tip-2.webp',
                  imageAlt: 'Person stepping back to photograph the full bulletin board',
                },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-5">
                  <div
                    className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full"
                    style={{
                      background: 'var(--sb-amber)',
                      color: 'var(--sb-charcoal)',
                    }}
                  >
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold mb-1"
                      style={{ color: 'var(--sb-charcoal)' }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="text-base mb-4"
                      style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
                    >
                      {s.desc}
                    </p>
                    <div
                      className="overflow-hidden"
                      style={{ borderRadius: 'var(--sb-radius)' }}
                    >
                      <Image
                        src={s.image}
                        alt={s.imageAlt}
                        width={480}
                        height={320}
                        className="w-full h-auto"
                        style={{ maxHeight: '220px', objectFit: 'cover', objectPosition: 'top' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who It's For ─────────────────────────────────── */}
        <section className="py-16 sm:py-20">
          <div className="max-w-[640px] mx-auto px-4">
            <h2
              className="text-2xl sm:text-3xl font-bold text-center mb-12"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Built for how small towns actually work.
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {[
                {
                  label: 'Community members',
                  quote: '\u201CI deleted Facebook but I still want to know what\u2019s happening in town.\u201D',
                  desc: 'Find local businesses, events, and services from the boards you already pass every day — now from your phone.',
                },
                {
                  label: 'Local businesses',
                  quote: '\u201CI don\u2019t have time for Instagram. I just want people to know I\u2019m here.\u201D',
                  desc: 'Your listing stays visible as long as it\u2019s current. Update it by taking a photo. No ad spend. No content calendar.',
                },
                {
                  label: 'Chambers & towns',
                  quote: '\u201CI need something real I can offer my members.\u201D',
                  desc: 'One platform serves every business in town. Community-maintained. Measurable. Replaces your printed directory on day one.',
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="p-6"
                  style={{
                    border: '1px solid var(--sb-warm-gray)',
                    borderRadius: 'var(--sb-radius)',
                    background: 'var(--sb-white)',
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ color: 'var(--sb-amber)' }}
                  >
                    {card.label}
                  </p>
                  <p
                    className="text-base italic mb-3"
                    style={{ color: 'var(--sb-charcoal)' }}
                  >
                    {card.quote}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
                  >
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust Signals ────────────────────────────────── */}
        <section
          className="py-16 sm:py-20"
          style={{ background: 'var(--sb-warm-white)' }}
        >
          <div className="max-w-[640px] mx-auto px-4">
            <h2
              className="text-2xl sm:text-3xl font-bold text-center mb-10"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              No tricks. No tracking. No nonsense.
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <Shield size={20} />, text: 'No account required — scan and browse.' },
                { icon: <Smartphone size={20} />, text: 'No app download — works in any phone browser.' },
                { icon: <Camera size={20} />, text: 'Photo-verified — timestamped and geo-fenced.' },
                { icon: <Flag size={20} />, text: 'Community-flagged — the community keeps itself honest.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5" style={{ color: 'var(--sb-amber)' }}>
                    {item.icon}
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Town Picker ──────────────────────────────────── */}
        <section id="towns" className="py-16 sm:py-20">
          <div className="max-w-[640px] mx-auto px-4">
            <h2
              className="text-2xl sm:text-3xl font-bold text-center mb-10"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              See what&rsquo;s posted in your town.
            </h2>

            <div className="mb-8">
              {towns.map((town) => (
                <Link
                  key={town.slug}
                  href={`/${town.slug}`}
                  className="flex items-center justify-between py-4"
                  style={{
                    borderBottom: '1px solid var(--sb-warm-gray)',
                    textDecoration: 'none',
                    minHeight: '56px',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={18} color="var(--sb-amber)" />
                    <div>
                      <span
                        className="text-base font-semibold"
                        style={{ color: 'var(--sb-charcoal)' }}
                      >
                        {town.name}
                      </span>
                      <span
                        className="text-sm ml-2"
                        style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
                      >
                        {town.boardCount} {town.boardCount === 1 ? 'board' : 'boards'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--sb-stone)" />
                </Link>
              ))}
            </div>

            <p className="text-center text-sm" style={{ color: 'var(--sb-stone)' }}>
              Don&rsquo;t see your town?{' '}
              <Link
                href="/start-town"
                className="font-semibold no-underline"
                style={{ color: 'var(--sb-amber)' }}
              >
                Bring Switchboard to your community &rarr;
              </Link>
            </p>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section
          className="py-16 sm:py-20"
          style={{ background: 'var(--sb-charcoal)' }}
        >
          <div className="max-w-[640px] mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
              Every town has a bulletin board. Now yours is online.
            </h2>
            <p
              className="text-base mb-8"
              style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
            >
              Real. Local. Now.
            </p>
            <a
              href="#towns"
              className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-base no-underline"
              style={{
                background: 'var(--sb-amber)',
                color: 'var(--sb-charcoal)',
                borderRadius: '6px',
                minHeight: '48px',
              }}
            >
              Find my town
            </a>
            <p
              className="text-sm mt-4"
              style={{ color: '#94A3B8', fontWeight: 300 }}
            >
              No signup. No download. Just scan.
            </p>
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

            <dl>
              {[
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
                  a: 'Yes. Browsing is free for community members. Listing on a board is free for businesses. Always.',
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
              ].map((faq, i) => (
                <div
                  key={i}
                  className="py-6"
                  style={{ borderBottom: '1px solid var(--sb-warm-gray)' }}
                >
                  <dt
                    className="text-base font-semibold"
                    style={{ color: 'var(--sb-charcoal)' }}
                  >
                    {faq.q}
                  </dt>
                  <dd
                    className="mt-2 text-sm"
                    style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
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
