import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Switchboard — Real. Local. Now.',
  description:
    'Switchboard is a community information network that turns physical bulletin boards into live, browsable pages. No accounts, no algorithms — just your community. Built by Rise Above Partners.',
  alternates: { canonical: 'https://switchboard.town/about' },
}

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <div className="max-w-[640px] mx-auto px-4 py-12">

          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              About Switchboard
            </h1>
            <p
              className="text-base"
              style={{ color: 'var(--sb-stone)' }}
            >
              Real. Local. Now.
            </p>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

            {/* What Is This */}
            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Bulletin boards are beautiful. But let&rsquo;s be real.
              </h2>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: 'var(--sb-slate)' }}
              >
                <p><strong style={{ fontWeight: 600 }}>We forget what was on them.</strong></p>
                <p>
                  There&rsquo;s a yoga instructor with a hand-written class schedule. A guy who fixes bikes
                  out of his garage. A local theater group doing something weird and wonderful next weekend.
                </p>
                <p>
                  They made a flyer. They found a thumbtack. They pinned it up. And most of us walked right past.
                </p>
                <p>
                  Those boards are full of real people doing real things in your actual neighborhood — not an
                  algorithm, not a sponsored post, not someone trying to go viral.{' '}
                  <strong style={{ fontWeight: 600 }}>Switchboard makes sure that stuff gets seen.</strong>
                </p>
              </div>
            </section>

            <hr style={{ borderColor: 'var(--sb-warm-gray)' }} />

            {/* How It Works */}
            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Post your flyer. Snap a photo. Done.
              </h2>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: 'var(--sb-slate)' }}
              >
                <p><strong style={{ fontWeight: 600 }}>1.</strong> Find a business board you want to update</p>
                <p><strong style={{ fontWeight: 600 }}>2.</strong> Scan the QR code at that location</p>
                <p><strong style={{ fontWeight: 600 }}>3.</strong> Take a photo of the entire bulletin board</p>
                <p><strong style={{ fontWeight: 600 }}>4.</strong> Your photo shows up!</p>
                <p
                  className="text-sm italic"
                  style={{ color: 'var(--sb-stone)' }}
                >
                  Your flyer now lives in two places: on the board and online. No likes. No followers.
                  No comments section. Just: here&rsquo;s what&rsquo;s happening near you, beyond social media.
                </p>
              </div>
            </section>

            <hr style={{ borderColor: 'var(--sb-warm-gray)' }} />

            {/* This is for the flyer people */}
            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                This is for the flyer people.
              </h2>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: 'var(--sb-slate)' }}
              >
                <p><strong style={{ fontWeight: 600 }}>You know who you are.</strong></p>
                <p>
                  You designed something in Canva at midnight. You printed 20 copies at the library.
                  You walked around with a stapler and a dream.
                </p>
                <p>
                  And then you thought: <em>&ldquo;I wish more people could see this.&rdquo;</em>
                </p>
                <p>
                  Your flyer deserves more than the six people who happened to glance at the board
                  that day. We&rsquo;re here to give it a longer life and a wider reach — while still
                  keeping it local, still keeping it real.
                </p>
              </div>
            </section>

            <hr style={{ borderColor: 'var(--sb-warm-gray)' }} />

            {/* Community philosophy */}
            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                A little nostalgia. A lot of community.
              </h2>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: 'var(--sb-slate)' }}
              >
                <p>
                  There&rsquo;s something beautiful about a physical bulletin board. It&rsquo;s messy. It&rsquo;s democratic.
                  Anyone can pin something up. No account required, no verification, no content policy —
                  just a thumbtack and something to say.
                </p>
                <p>
                  Switchboard isn&rsquo;t replacing that. We&rsquo;re extending it. The physical board is still the
                  real thing. This is just a way to make sure more people actually see it.
                </p>
                <p>
                  <strong style={{ fontWeight: 600 }}>
                    The best stuff still happens offline. We just want to make sure you hear about it.
                  </strong>
                </p>
              </div>
            </section>

            <hr style={{ borderColor: 'var(--sb-warm-gray)' }} />

            {/* Who built this */}
            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Who built this?
              </h2>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: 'var(--sb-slate)' }}
              >
                <p>
                  Switchboard is built by{' '}
                  <strong style={{ fontWeight: 600 }}>Rise Above Partners</strong>, a consulting studio
                  focused on community-first technology. We believe the best tools are the ones that
                  disappear — that make real-world connections easier without getting in the way.
                </p>
                <p>
                  Questions? Reach us at{' '}
                  <a
                    href="mailto:Hello@rise-above.net"
                    style={{ color: 'var(--sb-amber)' }}
                  >
                    Hello@rise-above.net
                  </a>
                </p>
              </div>
            </section>
          </div>

          {/* Back link */}
          <div
            className="mt-12 pt-8"
            style={{ borderTop: '1px solid var(--sb-warm-gray)' }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-base no-underline"
              style={{ color: 'var(--sb-amber)' }}
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </>
  )
}
