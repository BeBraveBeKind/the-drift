import Navigation from '@/components/Navigation'

export default function Loading() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#C4A574]">
        {/* Header skeleton */}
        <div className="text-center pt-6 pb-4">
          <div className="max-w-md mx-auto px-4">
            <div className="h-12 bg-gray-300/20 rounded animate-pulse mb-2 mx-auto w-48" />
            <div className="h-6 bg-gray-300/20 rounded animate-pulse w-64 mx-auto" />
          </div>
        </div>
        
        {/* Filter skeleton */}
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="flex justify-center gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-10 w-24 bg-gray-300/20 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        
        {/* Cards grid skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid gap-4 justify-center" style={{ 
            gridTemplateColumns: 'repeat(auto-fill, 240px)'
          }}>
            {[1,2,3,4,5,6,7,8,9].map(i => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="h-[180px] bg-gray-300/20 animate-pulse" />
                <div className="p-4">
                  <div className="h-5 bg-gray-300/20 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-300/20 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}