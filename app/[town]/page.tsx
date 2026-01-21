'use client'

import { useState, useEffect } from 'react'
import { getPhotoUrl } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, notFound } from 'next/navigation'
import { useLocations } from '@/hooks/useLocations'
import DiscoveryFilter from '@/components/DiscoveryFilter'
import MapView from '@/components/MapView'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BoardCard from '@/components/BoardCard'
import type { LocationWithPhoto } from '@/types'
import type { DiscoveryCategory } from '@/lib/businessProfiles'

// Clean, simple design - no unnecessary decorations
// Removed: cardRotations, cardPushpinColors, getRandomRotation, getRandomPushpinColor

// Format town name for display
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
  
  // Use formatted town name from townSlug as fallback
  const townName = formatTownName(townSlug)

  // Initialize filtered boards when data loads
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
        <div className="min-h-screen bg-[#C4A574]" />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Clean background - no cork texture */}
      
      {/* Header - Clean and Simple */}
      <header className="relative z-10 text-center pt-6 pb-4">
        <div className="max-w-md mx-auto px-4">
          <h1 className="text-display" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
            Switchboard
          </h1>
          <p className="text-subhead" style={{ color: 'var(--text-secondary)' }}>
            What's posted in {townName}
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
      <div className="relative z-10 max-w-6xl mx-auto px-4 mb-6">
        <div className="flex justify-center">
          <div className="filter-group">
            <button
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'filter-pill filter-pill--active' : 'filter-pill'}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={viewMode === 'map' ? 'filter-pill filter-pill--active' : 'filter-pill'}
            >
              Map View
            </button>
          </div>
        </div>
      </div>

      {/* Polaroid Cards Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-[#2C2C2C] font-medium">Loading boards...</div>
          </div>
        ) : viewMode === 'grid' ? (
          filteredBoards.length === 0 && allBoards.length > 0 ? (
            <div className="text-center py-20">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mx-auto max-w-md">
                <h3 className="text-heading mb-3" style={{ color: 'var(--text-primary)' }}>
                  No boards found
                </h3>
                <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  No bulletin boards match this category in {townName}. Try selecting "All" to see all boards.
                </p>
              </div>
            </div>
          ) : (
          <div className="w-full px-4">
            {/* Fixed width grid - no stretching */}
            <div className="grid gap-4 justify-center" style={{ 
              gridTemplateColumns: 'repeat(auto-fill, 240px)',
              maxWidth: '1440px',
              margin: '0 auto'
            }}>
              {filteredBoards.map((board, index) => (
                <BoardCard 
                  key={board.id}
                  board={board}
                  townSlug={townSlug}
                  index={index}
                />
              ))}
            </div>
          </div>
          )
        ) : (
          <div className="max-w-6xl mx-auto">
            <MapView 
              locations={filteredBoards}
              townSlug={townSlug}
              activeFilter={activeCategory}
            />
          </div>
        )}
      </section>
      
      <Footer />
      </main>
    </>
  )
}