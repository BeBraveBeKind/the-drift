import { Metadata } from 'next'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, QrCode, Camera, CheckCircle, AlertTriangle, X } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How to Post — Switchboard',
  description:
    'Update a community bulletin board on Switchboard in 3 steps: scan the QR code at any listed location, take a photo of the board, and it\'s live. No account needed.',
  alternates: { canonical: 'https://switchboard.town/how-to-post' },
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
              style={{ color: 'var(--sb-stone)' }}
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--sb-amber)',
                    color: 'var(--sb-charcoal)',
                  }}
                >
                  <QrCode size={20} />
                </div>
                <div className="flex-1">
                  <h2
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--sb-charcoal)' }}
                  >
                    1. Scan the QR code at the board
                  </h2>
                  <p
                    className="text-base mb-4"
                    style={{ color: 'var(--sb-slate)' }}
                  >
                    Each bulletin board has its own unique QR code. You must physically visit the location
                    and scan the code posted there. This ensures photos are authentic and taken at the actual location.
                  </p>
                  <div
                    className="overflow-hidden"
                    style={{ borderRadius: 'var(--sb-radius)' }}
                  >
                    <Image
                      src="/instructional/IMG_2408.jpg"
                      alt="Scanning the Switchboard QR code at a bulletin board with a phone"
                      width={480}
                      height={640}
                      className="w-full h-auto"
                      style={{ maxHeight: '280px', objectFit: 'cover', objectPosition: 'top' }}
                    />
                  </div>
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--sb-amber)',
                    color: 'var(--sb-charcoal)',
                  }}
                >
                  <Camera size={20} />
                </div>
                <div className="flex-1">
                  <h2
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--sb-charcoal)' }}
                  >
                    2. Take a photo of the full board
                  </h2>
                  <p
                    className="text-base mb-3"
                    style={{ color: 'var(--sb-slate)' }}
                  >
                    Capture the entire bulletin board — all the flyers, announcements, and posts currently displayed.
                  </p>
                  <ul
                    style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--sb-slate)' }}
                  >
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#16A34A' }} />
                      Step back — get the whole board in frame
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#16A34A' }} />
                      Shoot straight-on, not at an angle
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#16A34A' }} />
                      Good light — make sure flyers are readable
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#16A34A' }} />
                      No people in the shot — just the board
                    </li>
                  </ul>

                  {/* Good / Bad photo comparison */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div
                        className="relative overflow-hidden"
                        style={{ borderRadius: 'var(--sb-radius)' }}
                      >
                        <Image
                          src="/instructional/tip-1.webp"
                          alt="Bad example: person blocking the bulletin board, too close"
                          width={320}
                          height={240}
                          className="w-full h-auto"
                          style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                        />
                        <span
                          className="absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-1"
                          style={{
                            background: 'var(--sb-red)',
                            color: '#fff',
                            borderRadius: 'var(--sb-radius-sm)',
                          }}
                        >
                          <X size={12} strokeWidth={3} />
                          Too close
                        </span>
                      </div>
                    </div>
                    <div>
                      <div
                        className="relative overflow-hidden"
                        style={{ borderRadius: 'var(--sb-radius)' }}
                      >
                        <Image
                          src="/instructional/tip-2.webp"
                          alt="Good example: stepped back, full board visible while taking photo"
                          width={320}
                          height={240}
                          className="w-full h-auto"
                          style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                        />
                        <span
                          className="absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-1"
                          style={{
                            background: 'var(--sb-green)',
                            color: '#fff',
                            borderRadius: 'var(--sb-radius-sm)',
                          }}
                        >
                          <CheckCircle size={12} strokeWidth={3} />
                          Good
                        </span>
                      </div>
                    </div>
                  </div>
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--sb-amber)',
                    color: 'var(--sb-charcoal)',
                  }}
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
                    style={{ color: 'var(--sb-slate)' }}
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
              background: 'var(--sb-white)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--sb-amber)' }} />
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Photos will be reverted if they have:
              </h3>
            </div>
            <ul
              style={{ listStyle: 'disc', paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--sb-slate)' }}
            >
              <li>Heavy glare or reflections</li>
              <li>Blur or out-of-focus areas</li>
              <li>People in the photo (privacy)</li>
              <li>Poor framing or partial board coverage</li>
              <li>Inappropriate content</li>
            </ul>
          </div>

          {/* Guidelines */}
          <div style={{ marginBottom: '48px' }}>
            <h3
              style={{ fontSize: '18px', fontWeight: 600, color: 'var(--sb-charcoal)', marginBottom: '16px' }}
            >
              Guidelines
            </h3>
            <ul
              style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: 'var(--sb-slate)' }}
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
