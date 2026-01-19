import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function StartTownPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-8">Start a Town on Switchboard</h1>
          
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-8">
            <div className="px-8 sm:px-10 py-10">
              <h2 className="text-2xl font-bold mb-6">Bring Switchboard to Your Community</h2>
              <p className="text-stone-600 mb-8 text-lg">
                We're expanding Switchboard to new towns and looking for partnerships with Chambers of Commerce, 
                Main Street organizations, and other local groups to help bring our platform to communities.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-lg text-green-900 mb-3">🤝 Partnership Opportunities</h3>
                <p className="text-green-800 mb-4">
                  We're currently building our user base and are looking for partnerships with town Chambers 
                  or local organizations to help bring Switchboard to new towns.
                </p>
                <a 
                  href="mailto:hello@rise-above.net?subject=Bring%20Switchboard%20to%20Our%20Town" 
                  className="text-green-600 hover:text-green-700 font-semibold text-lg underline"
                >
                  hello@rise-above.net
                </a>
                <p className="text-green-700 mt-3 text-sm">
                  Let's discuss how we can work together to serve your community!
                </p>
              </div>

              <h3 className="font-bold text-lg mb-4">Starting a town on Switchboard includes:</h3>
              <ul className="space-y-3 text-stone-600 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Custom town page showcasing all participating local businesses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Support getting businesses signed up and onboarded</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Marketing materials and custom QR codes for each location</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Community engagement tools and promotional support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Local admin dashboard for town management</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Ongoing support and platform updates</span>
                </li>
              </ul>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-amber-900 mb-2">Perfect for:</h3>
                <ul className="text-amber-800 space-y-1">
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Contact Us About Partnership
                </a>
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 transition-colors font-medium"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}