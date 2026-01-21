import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'

export default function HowToPostPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-display mb-4" style={{ color: 'var(--text-primary)' }}>
              How to Post
            </h1>
            <p className="text-subhead" style={{ color: 'var(--text-secondary)' }}>
              Keep community boards fresh with new photos
            </p>
          </div>

          {/* In-Store Signage Example */}
          <section className="mb-12">
            <div className="rounded-lg overflow-hidden border-2" style={{ 
              borderColor: 'var(--border-strong)',
              backgroundColor: 'var(--bg-card)'
            }}>
              <div className="p-4 text-center" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <p className="text-caption mb-2">
                  This is what you'll see posted at each bulletin board location:
                </p>
              </div>
              <div className="bg-white p-4 flex justify-center">
                <img 
                  src="/signage-example.png" 
                  alt="In-store signage showing the 3-step process"
                  className="mx-auto block"
                  style={{ maxWidth: '500px', width: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </section>

          {/* Detailed Instructions */}
          <section className="space-y-8">
            <h2 className="text-heading" style={{ color: 'var(--text-primary)' }}>
              Detailed Instructions
            </h2>

            {/* Step 1 */}
            <div className="p-6 rounded-lg" style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)'
            }}>
              <h3 className="text-subhead mb-4" style={{ color: 'var(--text-primary)' }}>
                1. Use the QR Code at Each Location
              </h3>
              <p className="text-body mb-3" style={{ color: 'var(--text-secondary)' }}>
                <strong>Each bulletin board has its own unique QR code.</strong> You must physically visit the location and scan the QR code posted there to update that specific board.
              </p>
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                This ensures photos are authentic, recent, and taken at the actual location. No remote posting allowed!
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-lg" style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)'
            }}>
              <h3 className="text-subhead mb-4" style={{ color: 'var(--text-primary)' }}>
                2. Photo Guidelines
              </h3>
              <p className="text-body mb-4" style={{ color: 'var(--text-secondary)' }}>
                <strong>Capture the entire bulletin board</strong> in your photo. We want to see all the flyers, announcements, and community posts currently displayed.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  Take the photo straight-on, not at an angle
                </li>
                <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  Ensure good lighting - avoid glare and shadows
                </li>
                <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  Make sure the image is sharp and in focus
                </li>
                <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  Include the full board, edge to edge
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-lg" style={{ 
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)'
            }}>
              <h3 className="text-subhead mb-4" style={{ color: 'var(--text-primary)' }}>
                3. Quality Standards
              </h3>
              <p className="text-body mb-4" style={{ color: 'var(--text-secondary)' }}>
                <strong>Consider editing your photo before uploading.</strong> Photos with issues will be removed by admins and reverted to the most recent good photo.
              </p>
              
              <div className="p-4 rounded-lg" style={{ 
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--accent)'
              }}>
                <p className="font-semibold mb-3" style={{ color: 'var(--accent)' }}>
                  Photos will be removed if they have:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                    Heavy glare or reflections
                  </li>
                  <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                    Blur or out-of-focus areas
                  </li>
                  <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                    People in the photo (privacy)
                  </li>
                  <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                    Poor framing or partial board coverage
                  </li>
                  <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                    Inappropriate content
                  </li>
                </ul>
              </div>
            </div>

            {/* Additional Guidelines */}
            <div className="p-6 rounded-lg" style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)'
            }}>
              <h3 className="text-subhead mb-4" style={{ color: 'var(--text-primary)' }}>
                Additional Guidelines
              </h3>
              <ul className="list-disc pl-6 space-y-3">
                <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Respect privacy:</strong> Avoid including people in your photos
                </li>
                <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Be considerate:</strong> Don't obstruct others while taking photos
                </li>
                <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Regular updates:</strong> Feel free to update boards when you notice changes
                </li>
                <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Community effort:</strong> Help keep our local boards current and visible
                </li>
                <li className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Report issues:</strong> Contact us if you notice damaged or inappropriate content
                </li>
              </ul>
              
              <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-body font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Goal: Create a living archive of our community's activity and keep everyone connected to local happenings!
                </p>
              </div>
            </div>
          </section>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link href="/" className="btn-secondary">
              ← Back to Boards
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    </>
  )
}