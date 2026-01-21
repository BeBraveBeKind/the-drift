import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-display mb-8" style={{ color: 'var(--text-primary)' }}>
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg" style={{ color: 'var(--text-primary)' }}>
            <p className="text-body mb-6">
              <strong>Effective Date:</strong> January 1, 2026
            </p>

            <section className="mb-8">
              <h2 className="text-heading mb-4" style={{ color: 'var(--text-primary)' }}>
                Information We Collect
              </h2>
              <p className="text-body mb-4">
                When you use Switchboard, we collect minimal information necessary to provide our service:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-body">Business name and contact information when you claim a listing</li>
                <li className="text-body">Photos and content you upload to bulletin boards</li>
                <li className="text-body">Basic usage data to improve our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-heading mb-4" style={{ color: 'var(--text-primary)' }}>
                How We Use Your Information
              </h2>
              <p className="text-body mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-body">Display your business information on community bulletin boards</li>
                <li className="text-body">Connect community members with local businesses</li>
                <li className="text-body">Improve and maintain our services</li>
                <li className="text-body">Communicate with you about your listings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-heading mb-4" style={{ color: 'var(--text-primary)' }}>
                Information Sharing
              </h2>
              <p className="text-body mb-4">
                We do not sell, trade, or rent your personal information to third parties. Information you post on public bulletin boards is visible to all visitors. We may share information when required by law or to protect rights and safety.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-heading mb-4" style={{ color: 'var(--text-primary)' }}>
                Data Security
              </h2>
              <p className="text-body mb-4">
                We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure. You are responsible for maintaining the security of your account credentials.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-heading mb-4" style={{ color: 'var(--text-primary)' }}>
                Your Rights
              </h2>
              <p className="text-body mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-body">Access your personal information</li>
                <li className="text-body">Correct or update your information</li>
                <li className="text-body">Delete your account and associated data</li>
                <li className="text-body">Opt out of non-essential communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-heading mb-4" style={{ color: 'var(--text-primary)' }}>
                Cookies
              </h2>
              <p className="text-body mb-4">
                We use essential cookies to maintain your session and preferences. We do not use tracking or advertising cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-heading mb-4" style={{ color: 'var(--text-primary)' }}>
                Children's Privacy
              </h2>
              <p className="text-body mb-4">
                Our service is not directed to individuals under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-heading mb-4" style={{ color: 'var(--text-primary)' }}>
                Changes to This Policy
              </h2>
              <p className="text-body mb-4">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-heading mb-4" style={{ color: 'var(--text-primary)' }}>
                Contact Us
              </h2>
              <p className="text-body mb-4">
                If you have questions about this privacy policy or our data practices, please contact us at:
              </p>
              <p className="text-body">
                <strong>Email:</strong> <a href="mailto:Hello@rise-above.net" style={{ color: 'var(--link)' }}>Hello@rise-above.net</a><br />
                <strong>Operated by:</strong> Rise Above Partners and Ofigona LLC
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
            <Link 
              href="/" 
              className="text-body"
              style={{ color: 'var(--link)' }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}