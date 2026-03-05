import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, Check, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Get Listed — Switchboard',
  description:
    'Get your business on Switchboard for free. A dedicated page, custom QR code, and community-powered visibility.',
}

export default function GetListedPage() {
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
              Get Your Board on Switchboard
            </h1>
            <p
              className="text-base"
              style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
            >
              Free for every business. No catch.
            </p>
          </div>

          {/* Value prop */}
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
              &ldquo;I don&rsquo;t have time for Instagram. I just want people to know I&rsquo;m here.&rdquo;
            </p>
            <p
              className="text-base"
              style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
            >
              Switchboard puts your business in front of the people already walking past your door — no ad
              spend, no content calendar, no social media. Your listing stays visible as long as it&rsquo;s
              current. Update it by taking a photo. That&rsquo;s it.
            </p>
          </section>

          {/* What you get */}
          <section className="mb-10">
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              What you get
            </h2>
            <ul className="space-y-4">
              {[
                'A dedicated page for your bulletin board',
                'Custom QR code — we print and deliver it',
                'Photo-verified listing that stays current',
                'Community members update it for you',
                'View count and freshness tracking',
                'Free. Always.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--sb-amber)' }} />
                  <span
                    className="text-base"
                    style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <section
            className="p-8 text-center mb-10"
            style={{
              background: 'var(--sb-warm-white)',
              border: '2px solid var(--sb-amber)',
              borderRadius: 'var(--sb-radius)',
            }}
          >
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Ready to get listed?
            </h2>
            <p
              className="text-base mb-6"
              style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
            >
              We handle setup personally. Send us an email and we&rsquo;ll get you live.
            </p>
            <a
              href="mailto:Hello@rise-above.net?subject=Get%20Listed%20on%20Switchboard"
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
              style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
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
