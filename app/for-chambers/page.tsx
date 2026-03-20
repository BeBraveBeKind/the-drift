import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AnalyticsMockup from '@/components/AnalyticsMockup'
import Image from 'next/image'
import { ArrowLeft, Mail } from 'lucide-react'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Switchboard for Chambers of Commerce',
  description:
    'Give your members a tangible benefit they can see and measure. Switchboard turns community bulletin boards into a living platform — with view counts you can report to your board. No staff time required.',
  alternates: { canonical: 'https://switchboard.town/for-chambers' },
}

async function getStats() {
  const { count: boardCount } = await supabase
    .from('locations')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return { boardCount: boardCount || 0 }
}

/* Reusable inline check icon — avoids Lucide rendering issues */
function Chk() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F59E0B"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: '1px' }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default async function ForChambersPage() {
  const { boardCount } = await getStats()

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 16px' }}>

          {/* ── Hero ──────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{
              fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#F59E0B', marginBottom: '12px',
            }}>
              For Chambers of Commerce
            </p>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 800,
              lineHeight: 1.2, color: '#1E293B', marginBottom: '16px',
            }}>
              Next time a member asks &ldquo;what do I get for my dues?&rdquo; &mdash; show&nbsp;them.
            </h1>
            <p style={{
              fontSize: '16px', lineHeight: 1.6, color: '#475569', marginBottom: '20px',
            }}>
              Switchboard gives your chamber a visible, measurable platform
              your members can actually use &mdash; without adding to your staff&rsquo;s workload.
            </p>
            <div style={{ marginBottom: '28px', borderRadius: '8px', overflow: 'hidden' }}>
              <Image
                src="/hero-option-3-phone.jpg"
                alt="Phone showing community analytics on a small-town main street at golden hour"
                width={1344}
                height={768}
                priority
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <a
              href="mailto:Hello@rise-above.net?subject=Chamber%20Partnership%20%E2%80%94%20Switchboard"
              className="btn-primary"
              style={{ gap: '8px', textDecoration: 'none', fontSize: '16px', padding: '14px 32px' }}
            >
              <Mail size={18} />
              Schedule a Walkthrough
            </a>
            <p style={{ fontSize: '13px', color: '#78716C', marginTop: '10px' }}>
              $250/mo founding rate &middot; Annual contract
            </p>
          </div>

          {/* ── The Problem ───────────────────────────────────── */}
          <section style={{
            padding: '24px', marginBottom: '40px',
            background: '#fff', borderLeft: '4px solid #F59E0B',
            borderRadius: '8px',
          }}>
            <p style={{
              fontSize: '18px', fontStyle: 'italic', lineHeight: 1.6,
              color: '#1E293B', marginBottom: '12px',
            }}>
              &ldquo;I need something real I can offer my members &mdash; not another Facebook group they won&rsquo;t join.&rdquo;
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#475569' }}>
              Networking events are nice. Advocacy matters. But when renewal season
              comes, your members want to know: <em>what did I actually get?</em> Switchboard
              gives you an answer with a number attached.
            </p>
          </section>

          {/* ── Real Numbers + Analytics ──────────────────────── */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
              Real numbers for your next board meeting
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', marginBottom: '20px' }}>
              View counts, freshness data, engagement trends &mdash; board-deck-ready
              numbers. Zero staff time.
            </p>
            <AnalyticsMockup />
          </section>

          {/* ── How Every Member Benefits ──────────────────────── */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
              How every member benefits
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', marginBottom: '20px' }}>
              Bulletin boards are community infrastructure &mdash; some members host them, every member can use them.
            </p>

            {/* Board hosts */}
            <div style={{
              padding: '20px', marginBottom: '12px',
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#F59E0B', marginBottom: '14px',
              }}>
                Members with bulletin boards
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'A dedicated listing page with name, category, and directions',
                  'A custom QR sign — we print and deliver it',
                  'Community-updated photos keep the listing current',
                  'View counts they can see and you can report',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Chk />
                    <span style={{ fontSize: '14px', lineHeight: 1.5, color: '#334155' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-board members */}
            <div style={{
              padding: '20px',
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#F59E0B', marginBottom: '14px',
              }}>
                Members without bulletin boards
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Post flyers on any Switchboard board — their event or service shows up when someone scans',
                  'Visibility through boards that already exist, without needing their own',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Chk />
                    <span style={{ fontSize: '14px', lineHeight: 1.5, color: '#334155' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── How It Works ──────────────────────────────────── */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
              How it works
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', marginBottom: '20px' }}>
              We prep everything. Your team handles the last mile.
            </p>

            {/* You bring */}
            <div style={{
              padding: '20px', marginBottom: '12px',
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#1E293B', marginBottom: '14px',
              }}>
                You bring
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Participating business names, websites, and Google Maps listings',
                  'People power to post signage at businesses and snap the first photo',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Chk />
                    <span style={{ fontSize: '14px', lineHeight: 1.5, color: '#334155' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* We deliver */}
            <div style={{
              padding: '20px',
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#F59E0B', marginBottom: '14px',
              }}>
                We deliver
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Every business added to your branded town page',
                  'Print-ready sign PDFs in your choice of layout (6\u00d79, 9\u00d76, 8.5\u00d711, 11\u00d78.5, or custom)',
                  'Booklets explaining Switchboard for each business',
                  'View count and freshness reporting from day one',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Chk />
                    <span style={{ fontSize: '14px', lineHeight: 1.5, color: '#334155' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Proof: Viroqua ─────────────────────────────────── */}
          <section style={{
            padding: '24px', marginBottom: '40px',
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
          }}>
            <p style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#F59E0B', marginBottom: '16px',
            }}>
              Already live in Viroqua, WI
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
              {[
                { value: `${boardCount}+`, label: 'boards online' },
                { value: '1', label: 'afternoon to launch' },
                { value: '0', label: 'ongoing staff time' },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '14px', color: '#475569', textAlign: 'center', marginBottom: '12px' }}>
              We prepped everything. A team posted signs and took first photos in a single afternoon. The community maintains it from there.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link
                href="/viroqua"
                className="btn-text"
                style={{ gap: '4px', fontSize: '14px', textDecoration: 'none' }}
              >
                See Viroqua live &rarr;
              </Link>
            </div>
          </section>

          {/* ── Pricing ───────────────────────────────────────── */}
          <section style={{ marginBottom: '40px' }}>
            <div style={{
              padding: '24px',
              border: '2px solid #F59E0B', borderRadius: '8px',
              background: '#fff',
            }}>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#F59E0B', marginBottom: '8px',
              }}>
                Founding Partner
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#1E293B' }}>$250</span>
                <span style={{ fontSize: '16px', color: '#94a3b8' }}>/month</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#F59E0B', marginBottom: '20px' }}>
                Introductory rate for next 3 towns.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  'Every business added and managed on your town page',
                  'Print-ready sign PDFs in multiple layouts',
                  'Booklets for each participating business',
                  'Branded town page with your chamber\u2019s community',
                  'View count and freshness reporting',
                  'Priority feature requests',
                  'Locked-in founding rate',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Chk />
                    <span style={{ fontSize: '14px', lineHeight: 1.5, color: '#334155' }}>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#78716C', lineHeight: 1.5 }}>
                Less than $8.50/day &mdash; less than most chambers spend on a single
                printed directory. Month-to-month. Cancel anytime.
              </p>
            </div>
          </section>

          {/* ── Mid-page CTA ────────────────────────────────────── */}
          <section style={{ textAlign: 'center', marginBottom: '40px' }}>
            <a
              href="mailto:Hello@rise-above.net?subject=Chamber%20Partnership%20%E2%80%94%20Switchboard"
              className="btn-primary"
              style={{ gap: '8px', textDecoration: 'none', fontSize: '16px', padding: '14px 32px' }}
            >
              <Mail size={18} />
              Schedule a Walkthrough
            </a>
            <p style={{ fontSize: '13px', color: '#78716C', marginTop: '10px' }}>
              Hello@rise-above.net &middot; We respond within 24 hours
            </p>
          </section>

          {/* ── FAQ ───────────────────────────────────────────── */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginBottom: '16px' }}>
              Common questions
            </h2>
            {[
              {
                q: 'What about members without a bulletin board?',
                a: 'They post flyers on boards that ARE on Switchboard. Their event or service shows up when someone scans. Some members host boards, every member can use them.',
              },
              {
                q: 'How long does setup take?',
                a: 'You send us business names, URLs, and Google Maps listings. We build everything in 1\u20132 weeks. Your team posts signage and snaps first photos in an afternoon.',
              },
              {
                q: 'Who maintains the listings?',
                a: 'The community. Anyone at a board location can snap a photo to update it. Photos are geo-verified.',
              },
              {
                q: 'What data do we get?',
                a: 'View counts per listing, last-updated timestamps, freshness metrics. Board-deck-ready numbers.',
              },
              {
                q: 'Is there a contract?',
                a: 'Month-to-month. Founding partners keep their rate locked as long as they stay.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}
              >
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                  {faq.q}
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#475569' }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </section>

          {/* ── Final CTA ───────────────────────────────────────── */}
          <section style={{
            padding: '32px', textAlign: 'center', marginBottom: '40px',
            background: '#1E293B', borderRadius: '8px',
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Ready to give your members something real?
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '24px' }}>
              Live demo on your phone. Town page ready in weeks, not months.
            </p>
            <a
              href="mailto:Hello@rise-above.net?subject=Chamber%20Partnership%20%E2%80%94%20Switchboard"
              className="btn-primary"
              style={{ gap: '8px', textDecoration: 'none', fontSize: '16px', padding: '14px 32px' }}
            >
              <Mail size={18} />
              Schedule a Walkthrough
            </a>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '12px' }}>
              Hello@rise-above.net
            </p>
          </section>

          {/* ── Back link ─────────────────────────────────────── */}
          <div style={{ paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
            <Link
              href="/"
              className="btn-text"
              style={{ gap: '8px', fontSize: '16px', textDecoration: 'none' }}
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>

          <div style={{ marginTop: '32px' }}>
            <Footer />
          </div>
        </div>
      </main>
    </>
  )
}
