import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, QrCode, Camera, CheckCircle, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How to Post — Switchboard',
  description:
    'Learn how to update a community bulletin board on Switchboard. Scan the QR code, take a photo, done.',
}

export default function HowToPostPage() {
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
              How to Post
            </h1>
            <p
              className="text-base"
              style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
            >
              Keep community boards fresh with new photos
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-8 mb-12">

            {/* Step 1 */}
            <div
              className="p-6"
              style={{
                border: '1px solid var(--sb-warm-gray)',
                borderRadius: 'var(--sb-radius)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ background: 'var(--sb-amber)', color: 'var(--sb-charcoal)' }}
                >
                  <QrCode size={20} />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--sb-charcoal)' }}
                  >
                    1. Scan the QR code at the board
                  </h2>
                  <p
                    className="text-base"
                    style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
                  >
                    Each bulletin board has its own unique QR code. You must physically visit the location
                    and scan the code posted there. This ensures photos are authentic and taken at the actual location.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className="p-6"
              style={{
                border: '1px solid var(--sb-warm-gray)',
                borderRadius: 'var(--sb-radius)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ background: 'var(--sb-amber)', color: 'var(--sb-charcoal)' }}
                >
                  <Camera size={20} />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--sb-charcoal)' }}
                  >
                    2. Take a photo of the full board
                  </h2>
                  <p
                    className="text-base mb-3"
                    style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
                  >
                    Capture the entire bulletin board — all the flyers, announcements, and posts currently displayed.
                  </p>
                  <ul
                    className="space-y-2 text-sm"
                    style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
                  >
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                      Take the photo straight-on, not at an angle
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                      Ensure good lighting — avoid glare and shadows
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                      Make sure the image is sharp and in focus
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                      Include the full board, edge to edge
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className="p-6"
              style={{
                border: '1px solid var(--sb-warm-gray)',
                borderRadius: 'var(--sb-radius)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ background: 'var(--sb-amber)', color: 'var(--sb-charcoal)' }}
                >
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--sb-charcoal)' }}
                  >
                    3. Your photo shows up!
                  </h2>
                  <p
                    className="text-base"
                    style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
                  >
                    That&rsquo;s it. Your photo is now the latest view of the board.
                    No account, no login, no approval process. The community keeps its own boards current.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quality standards */}
          <div
            className="p-6 mb-12"
            style={{
              border: '2px solid var(--sb-amber)',
              borderRadius: 'var(--sb-radius)',
              background: 'var(--sb-warm-white)',
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--sb-amber)' }} />
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Photos will be reverted if they have:
              </h3>
            </div>
            <ul
              className="space-y-2 text-sm pl-8"
              style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
            >
              <li>Heavy glare or reflections</li>
              <li>Blur or out-of-focus areas</li>
              <li>People in the photo (privacy)</li>
              <li>Poor framing or partial board coverage</li>
              <li>Inappropriate content</li>
            </ul>
          </div>

          {/* Guidelines */}
          <div className="space-y-4 mb-12">
            <h3
              className="text-lg font-semibold"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Guidelines
            </h3>
            <ul
              className="space-y-3 text-base"
              style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
            >
              <li><strong style={{ fontWeight: 600 }}>Respect privacy:</strong> Avoid including people in your photos</li>
              <li><strong style={{ fontWeight: 600 }}>Be considerate:</strong> Don&rsquo;t obstruct others while taking photos</li>
              <li><strong style={{ fontWeight: 600 }}>Update often:</strong> Snap a new photo whenever you notice changes</li>
              <li><strong style={{ fontWeight: 600 }}>Report issues:</strong> Flag anything inappropriate directly from the board page</li>
            </ul>
          </div>

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
