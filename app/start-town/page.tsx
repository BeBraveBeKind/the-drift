import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Mail, Users } from 'lucide-react'

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
        <div className="max-w-[640px] mx-auto px-4" style={{ paddingTop: '48px', paddingBottom: '0' }}>

          {/* Header */}
          <div className="text-center" style={{ marginBottom: '48px' }}>
            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: 'var(--sb-charcoal)', marginBottom: '12px' }}
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
            style={{
              border: '1px solid var(--sb-warm-gray)',
              borderRadius: 'var(--sb-radius)',
              padding: '24px',
              marginBottom: '40px',
            }}
          >
            <p
              className="text-base italic"
              style={{ color: 'var(--sb-charcoal)', marginBottom: '16px' }}
            >
              &ldquo;I need something real I can offer my members.&rdquo;
            </p>
            <p
              className="text-base"
              style={{ color: 'var(--sb-slate)', lineHeight: '1.6' }}
            >
              Printed directories are outdated by February. Facebook groups exclude half your members.
              Switchboard gives every business in town a live, visible listing — maintained by the community,
              not by chamber staff. One platform. Every business. Zero content management.
            </p>
          </section>

          {/* What a town gets */}
          <section style={{ marginBottom: '40px' }}>
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--sb-charcoal)', marginBottom: '24px' }}
            >
              What your town gets
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'A custom town page with every participating business',
                'QR codes printed and delivered for each board location',
                'Community-maintained listings — no staff needed',
                'View counts and freshness metrics you can report to your board',
                'Onboarding support for every business',
                'Ongoing platform updates at no cost',
              ].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ fontSize: '16px', color: 'var(--sb-slate)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Perfect for */}
          <section
            style={{
              background: 'var(--sb-white)',
              borderRadius: 'var(--sb-radius)',
              border: '1px solid var(--sb-warm-gray)',
              padding: '24px',
              marginBottom: '40px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Users size={20} style={{ color: 'var(--sb-amber)' }} />
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Perfect for
              </h3>
            </div>
            <ul style={{ listStyle: 'disc', paddingLeft: '32px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--sb-slate)', fontSize: '16px' }}>
              <li>Chambers of Commerce</li>
              <li>Main Street Organizations</li>
              <li>Business Improvement Districts</li>
              <li>Tourism Boards</li>
              <li>Economic Development Groups</li>
            </ul>
          </section>

          {/* CTA */}
          <section
            className="text-center"
            style={{
              border: '2px solid var(--sb-amber)',
              borderRadius: 'var(--sb-radius)',
              background: 'var(--sb-white)',
              padding: '32px 32px 40px',
              marginBottom: '40px',
            }}
          >
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--sb-charcoal)', marginBottom: '8px' }}
            >
              Let&rsquo;s talk about your town.
            </h2>
            <p
              className="text-base"
              style={{ color: 'var(--sb-stone)', marginBottom: '24px' }}
            >
              We&rsquo;ll walk you through how it works and what launch looks like.
            </p>
            <a
              href="mailto:Hello@rise-above.net?subject=Bring%20Switchboard%20to%20Our%20Town"
              className="btn-primary"
              style={{ gap: '8px', textDecoration: 'none', fontSize: '16px', padding: '14px 32px' }}
            >
              <Mail size={18} />
              Email Hello@rise-above.net
            </a>
            <p
              className="text-sm"
              style={{ color: 'var(--sb-stone)', marginTop: '12px' }}
            >
              We respond within 24 hours.
            </p>
          </section>

          <Footer />
        </div>
      </main>
    </>
  )
}
