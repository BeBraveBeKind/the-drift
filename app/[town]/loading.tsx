import Navigation from '@/components/Navigation'

export default function Loading() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Header skeleton */}
        <div className="text-center pt-6 pb-4">
          <div className="max-w-[640px] mx-auto px-4">
            <div
              className="h-10 rounded animate-pulse mb-2 mx-auto w-48"
              style={{ background: 'var(--sb-warm-gray)' }}
            />
            <div
              className="h-5 rounded animate-pulse w-64 mx-auto"
              style={{ background: 'var(--sb-warm-gray)' }}
            />
          </div>
        </div>

        {/* Filter skeleton */}
        <div className="max-w-[640px] mx-auto px-4 mb-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-24 rounded-full animate-pulse"
                style={{ background: 'var(--sb-warm-gray)' }}
              />
            ))}
          </div>
        </div>

        {/* Cards grid skeleton */}
        <div className="max-w-[640px] mx-auto px-4 py-8">
          <div
            className="grid gap-4 justify-center"
            style={{ gridTemplateColumns: 'repeat(auto-fill, 240px)' }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden"
                style={{ borderRadius: 'var(--sb-radius)', border: '1px solid var(--sb-warm-gray)' }}
              >
                <div
                  className="h-[180px] animate-pulse"
                  style={{ background: 'var(--sb-warm-gray)' }}
                />
                <div className="p-4">
                  <div
                    className="h-5 rounded animate-pulse mb-2"
                    style={{ background: 'var(--sb-warm-gray)' }}
                  />
                  <div
                    className="h-4 rounded animate-pulse w-3/4"
                    style={{ background: 'var(--sb-warm-gray)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
