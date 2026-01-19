import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function GetListedPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-8">Get Your Business Listed</h1>
          
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-8">
            <div className="px-8 sm:px-10 py-10">
              <h2 className="text-2xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-stone-600 mb-8 text-lg">
                We're currently building our user base and onboarding businesses manually to ensure 
                the best experience. Contact us to get your bulletin board on Switchboard!
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-lg text-blue-900 mb-3">📧 Email Us to Get Started</h3>
                <a 
                  href="mailto:hello@rise-above.net?subject=Get%20Listed%20on%20Switchboard" 
                  className="text-blue-600 hover:text-blue-700 font-semibold text-lg underline"
                >
                  hello@rise-above.net
                </a>
                <p className="text-blue-700 mt-3 text-sm">
                  We'll respond within 24 hours to help you get set up!
                </p>
              </div>

              <h3 className="font-bold text-lg mb-4">Getting listed is free and includes:</h3>
              <ul className="space-y-3 text-stone-600 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>A dedicated page for your bulletin board</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Custom QR code for customers to post photos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Real-time updates when new content is posted</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Analytics dashboard to track views and engagement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Support and guidance throughout setup</span>
                </li>
              </ul>
              
              <div className="flex gap-4">
                <a 
                  href="mailto:hello@rise-above.net?subject=Get%20Listed%20on%20Switchboard" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Email Us Now
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