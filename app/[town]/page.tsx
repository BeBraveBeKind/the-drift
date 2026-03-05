'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useLocations } from '@/hooks/useLocations'
import Navigation from '@/components/Navigation'
import BoardCard from '@/components/BoardCard'
import DiscoveryFilter from '@/components/DiscoveryFilter'
import MapView from '@/components/MapView'
import Footer from '@/components/Footer'
import type { LocationWithPhoto } from '@/types'
import type { DiscoveryCategory } from '@/lib/businessProfiles'

function formatTownName(town: string) {
  return town.charAt(0).toUpperCase() + town.slice(1)
}

export default function TownHomePage() {
  const params = useParams()
  const townSlug = params.town as string
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [filteredBoards, setFilteredBoards] = useState<LocationWithPhoto[]>([])
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory | 'all'>('all')

  const { locations: allBoards, loading, error } = useLocations(townSlug)
  const townName = formatTownName(townSlug)

  useEffect(() => {
    if (allBoards.length > 0) {
      setFilteredBoards(allBoards)
    }
  }, [allBoards])

  const handleFilterChange = (filtered: LocationWithPhoto[], category: DiscoveryCategory | 'all') => {
    setFilteredBoards(filtered)
    setActiveCategory(category)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (error === 'Town not found') {
      notFound()
    }
  }, [error])

  if (!mounted) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen">
          <div className="text-center pt-6 pb-4">
            <div className="max-w-md mx-auto px-4">
              <div
                className="h-12 rounded animate-pulse mb-2"
                style={{ background: 'var(--sb-warm-gray)' }}
              />
              <div
                className="h-6 rounded animate-pulse w-3/4 mx-auto"
                style={{ background: 'var(--sb-warm-gray)' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-[640px] mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded animate-pulse"
                style={{ background: 'var(--sb-warm-gray)' }}
              />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Header */}
        <header className="text-center pt-6 pb-4">
          <div className="max-w-[640px] mx-auto px-4">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-2"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Switchboard
            </h1>
            <p className="text-base" style={{ color: 'var(--sb-stone)' }}>
              What&rsquo;s posted in {townName}
            </p>
          </div>
        </header>

        {/* Discovery Filter */}
        {allBoards.length > 0 && (
          <DiscoveryFilter
            locations={allBoards}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* View Mode Toggle */}
        <div className="max-w-[640px] mx-auto px-4 mb-6">
          <div className="flex justify-center">
            <div className="filter-group">
              <button
                onClick={() => setViewMode('grid')}
                className={`filter-chip ${viewMode === 'grid' ? 'filter-chip--active' : ''}`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`filter-chip ${viewMode === 'map' ? 'filter-chip--active' : ''}`}
              >
                Map View
              </button>
            </div>
          </div>
        </div>

        {/* Board Cards */}
        <section className="max-w-[640px] mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--sb-stone)' }}>Loading boards...</p>
            </div>
          ) : viewMode === 'grid' ? (
            filteredBoards.length === 0 && allBoards.length > 0 ? (
              <div className="text-center py-20">
                <div
                  className="p-8 rounded-lg mx-auto max-w-md"
                  style={{
                    background: 'var(--sb-white)',
                    border: '1px solid var(--sb-warm-gray)',
                    borderRadius: 'var(--sb-radius)',
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: 'var(--sb-charcoal)' }}
                  >
                    No boards found
                  </h3>
                  <p className="text-base" style={{ color: 'var(--sb-stone)' }}>
                    No bulletin boards match this category in {townName}. Try
                    selecting &ldquo;All&rdquo; to see all boards.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="grid gap-4 justify-center"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, 240px)',
                }}
              >
                {filteredBoards.map((board, index) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    townSlug={townSlug}
                    index={index}
                  />
                ))}
              </div>
            )
          ) : (
            <div>
              <MapView
                locations={filteredBoards}
                townSlug={townSlug}
                activeFilter={activeCategory}
              />
            </div>
          )}
        </section>

        <div className="max-w-[640px] mx-auto px-4">
          <Footer />
        </div>
      </main>
    </>
  )
}
