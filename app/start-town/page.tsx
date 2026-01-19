import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function StartTownPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-8">Start a Town on Switchboard</h1>
          
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-8">
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
              <p className="text-stone-600 mb-6">
                Want to bring Switchboard to your town? We're expanding and would love to help 
                your community share local news and information.
              </p>
              <p className="text-stone-600 mb-6">
                Starting a town includes:
              </p>
              <ul className="list-disc list-inside text-stone-600 space-y-2 mb-6">
                <li>Custom town page with all local businesses</li>
                <li>Support getting businesses signed up</li>
                <li>Marketing materials and QR codes</li>
                <li>Community engagement tools</li>
                <li>Local admin dashboard</li>
              </ul>
              <p className="text-stone-600 mb-6">
                Contact us to learn more about bringing Switchboard to your community.
              </p>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}