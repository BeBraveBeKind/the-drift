import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-2">Nothing here</h1>
      <p className="text-stone-500 mb-6">This board doesn't exist or has been removed.</p>
      <Link 
        href="/" 
        className="text-blue-600 hover:underline"
      >
        ← Back to Switchboard
      </Link>
    </main>
  )
}