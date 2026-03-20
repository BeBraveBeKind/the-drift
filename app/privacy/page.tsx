import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <div className="max-w-[640px] mx-auto px-4 py-12">
          <h1
            className="text-3xl font-bold mb-8"
            style={{ color: 'var(--sb-charcoal)' }}
          >
            Privacy Policy
          </h1>

          <div style={{ color: 'var(--sb-slate)' }}>
            <p className="text-base mb-6">
              <strong style={{ color: 'var(--sb-charcoal)' }}>Effective Date:</strong> January 1, 2026
            </p>

            <section className="mb-8">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Information We Collect
              </h2>
              <p className="text-base mb-3">
                When you use Switchboard, we collect minimal information necessary to provide our service:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-2 text-base">
                <li>Business name and contact information when you claim a listing</li>
                <li>Photos and content you upload to bulletin boards</li>
                <li>Basic usage data to improve our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                How We Use Your Information
              </h2>
              <p className="text-base mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-2 text-base">
                <li>Display your business information on community bulletin boards</li>
                <li>Connect community members with local businesses</li>
                <li>Improve and maintain our services</li>
                <li>Communicate with you about your listings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Information Sharing
              </h2>
              <p className="text-base mb-3">
                We do not sell, trade, or rent your personal information to third parties. Information you post on public bulletin boards is visible to all visitors. We may share information when required by law or to protect rights and safety.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Data Security
              </h2>
              <p className="text-base mb-3">
                We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure. You are responsible for maintaining the security of your account credentials.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Your Rights
              </h2>
              <p className="text-base mb-3">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-2 text-base">
                <li>Access your personal information</li>
                <li>Correct or update your information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Cookies
              </h2>
              <p className="text-base mb-3">
                We use essential cookies to maintain your session and preferences. We do not use tracking or advertising cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Children&rsquo;s Privacy
              </h2>
              <p className="text-base mb-3">
                Our service is not directed to individuals under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Changes to This Policy
              </h2>
              <p className="text-base mb-3">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Contact Us
              </h2>
              <p className="text-base mb-3">
                If you have questions about this privacy policy or our data practices, please contact us at:
              </p>
              <p className="text-base">
                <strong style={{ color: 'var(--sb-charcoal)' }}>Email:</strong>{' '}
                <a href="mailto:Hello@rise-above.net" style={{ color: 'var(--sb-amber)' }}>
                  Hello@rise-above.net
                </a>
                <br />
                <strong style={{ color: 'var(--sb-charcoal)' }}>Operated by:</strong> Ofigona LLC
              </p>
            </section>
          </div>

          <div
            className="mt-12 pt-8"
            style={{ borderTop: '1px solid var(--sb-warm-gray)' }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-base"
              style={{ color: 'var(--sb-amber)', textDecoration: 'none' }}
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
