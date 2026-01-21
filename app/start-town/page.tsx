import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function StartTownPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-8">Start a Town on Switchboard</h1>
          
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-8">
            <div className="px-10 sm:px-12 py-12">
              <h2 className="text-2xl font-bold mb-6">Bring Switchboard to Your Community</h2>
              <p className="text-stone-600 mb-8 text-lg">
                We're expanding Switchboard to new towns and looking for partnerships with Chambers of Commerce, 
                Main Street organizations, and other local groups to help bring our platform to communities.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
                <h3 className="font-bold text-lg text-blue-900 mb-3">🤝 Partnership Opportunities</h3>
                <p className="text-blue-800 mb-4">
                  We're currently building our user base and are looking for partnerships with town Chambers 
                  or local organizations to help bring Switchboard to new towns.
                </p>
                <div className="bg-white border border-blue-300 rounded-lg p-4 inline-block">
                  <a 
                    href="mailto:hello@rise-above.net?subject=Bring%20Switchboard%20to%20Our%20Town" 
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-700 font-mono text-lg"
                  >
                    <span>hello@rise-above.net</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <p className="text-xs text-stone-600 mt-2">
                    Click to open your email app with a pre-filled subject
                  </p>
                </div>
                <p className="text-blue-700 mt-4 text-sm">
                  Let's discuss how we can work together to serve your community!
                </p>
              </div>

              <h3 className="font-bold text-lg mb-4">Starting a town on Switchboard includes:</h3>
              <ul className="space-y-3 text-stone-600 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 text-lg">▶</span>
                  <span>Custom town page showcasing all participating local businesses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 text-lg">▶</span>
                  <span>Support getting businesses signed up and onboarded</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 text-lg">▶</span>
                  <span>Marketing materials and custom QR codes for each location</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 text-lg">▶</span>
                  <span>Community engagement tools and promotional support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 text-lg">▶</span>
                  <span>Local admin dashboard for town management</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 text-lg">▶</span>
                  <span>Ongoing support and platform updates</span>
                </li>
              </ul>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 mb-8">
                <h3 className="font-bold text-purple-900 mb-3">Perfect for:</h3>
                <ul className="text-purple-800 space-y-2">
                  <li>• Chambers of Commerce</li>
                  <li>• Main Street Organizations</li>
                  <li>• Business Improvement Districts</li>
                  <li>• Tourism Boards</li>
                  <li>• Economic Development Groups</li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <a 
                  href="mailto:hello@rise-above.net?subject=Bring%20Switchboard%20to%20Our%20Town" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Open Email About Partnership
                </a>
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 transition-colors font-medium"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}