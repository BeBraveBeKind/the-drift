import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function GetListedPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-8">Get Your Business Listed</h1>
          
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-8">
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
              <p className="text-stone-600 mb-6">
                We're working on making it easy for businesses to get listed on Switchboard. 
                In the meantime, please contact us directly.
              </p>
              <p className="text-stone-600 mb-6">
                Getting listed is free and includes:
              </p>
              <ul className="list-disc list-inside text-stone-600 space-y-2 mb-6">
                <li>A dedicated page for your bulletin board</li>
                <li>QR code for customers to post photos</li>
                <li>Real-time updates when new content is posted</li>
                <li>Analytics on views and engagement</li>
              </ul>
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