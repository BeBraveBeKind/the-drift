import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, Check, Mail, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bring Switchboard to Your Town',
  description:
    'Launch Switchboard in your community. We partner with chambers of commerce, local organizations, and community leaders to bring bulletin boards online. Free setup, measurable results.',
  alternates: { canonical: 'https://switchboard.town/start-town' },
}

export default function StartTownPage() {
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
              Bring Switchboard to Your Town
            </h1>
            <p
              className="text-base"
              style={{ color: 'var(--sb-stone)' }}
            >
              A tangible benefit for every member business.
            </p>
          </div>

          {/* Carol's pain */}
          <section
            className="p-6 mb-10"
            style={{
              border: '1px solid var(--sb-warm-gray)',
              borderRadius: 'var(--sb-radius)',
            }}
          >
            <p
              className="text-base italic mb-4"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              &ldquo;I need something real I can offer my members.&rdquo;
            </p>
            <p
              className="text-base"
              style={{ color: 'var(--sb-slate)' }}
            >
              Printed directories are outdated by February. Facebook groups exclude half your members.
              Switchboard gives every business in town a live, visible listing — maintained by the community,
              not by chamber staff. One platform. Every business. Zero content management.
            </p>
          </section>

          {/* What a town gets */}
          <section className="mb-10">
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              What your town gets
            </h2>
            <ul className="space-y-4">
              {[
                'A custom town page with every participating business',
                'QR codes printed and delivered for each board location',
                'Community-maintained listings — no staff needed',
                'View counts and freshness metrics you can report to your board',
                'Onboarding support for every business',
                'Ongoing platform updates at no cost',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--sb-amber)' }} />
                  <span
                    className="text-base"
                    style={{ color: 'var(--sb-slate)' }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Perfect for */}
          <section
            className="p-6 mb-10"
            style={{
              background: 'var(--sb-white)',
              borderRadius: 'var(--sb-radius)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Users size={20} style={{ color: 'var(--sb-amber)' }} />
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Perfect for
              </h3>
            </div>
            <ul
              className="space-y-2 text-base pl-8"
              style={{ color: 'var(--sb-slate)' }}
            >
              <li>Chambers of Commerce</li>
              <li>Main Street Organizations</li>
              <li>Business Improvement Districts</li>
              <li>Tourism Boards</li>
              <li>Economic Development Groups</li>
            </ul>
          </section>

          {/* CTA */}
          <section
            className="p-8 text-center mb-10"
            style={{
              border: '2px solid var(--sb-amber)',
              borderRadius: 'var(--sb-radius)',
              background: 'var(--sb-white)',
            }}
          >
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Let&rsquo;s talk about your town.
            </h2>
            <p
              className="text-base mb-6"
              style={{ color: 'var(--sb-stone)' }}
            >
              We&rsquo;ll walk you through how it works and what launch looks like.
            </p>
            <a
              href="mailto:Hello@rise-above.net?subject=Bring%20Switchboard%20to%20Our%20Town"
              className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-base no-underline"
              style={{
                background: 'var(--sb-amber)',
                color: 'var(--sb-charcoal)',
                borderRadius: '6px',
                minHeight: '48px',
              }}
            >
              <Mail size={18} />
              Email Hello@rise-above.net
            </a>
            <p
              className="text-sm mt-3"
              style={{ color: 'var(--sb-stone)' }}
            >
              We respond within 24 hours.
            </p>
          </section>

          {/* Back link */}
          <div
            className="pt-8"
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
