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
import type { LocationWithPhoto } from '@/types'
import type { DiscoveryCategory } from '@/lib/businessProfiles'

// Memoize random values to prevent layout shifts
const cardRotations = new Map<string, number>()

// Random rotation for cards - more subtle
function getRandomRotation(id?: string) {
  if (id && cardRotations.has(id)) {
    return cardRotations.get(id)!
  }
  const rotation = Math.random() * 4 - 2 // -2 to +2 degrees (more subtle)
  if (id) cardRotations.set(id, rotation)
  return rotation
}

// Format town name for display
function formatTownName(town: string) {
  return town.charAt(0).toUpperCase() + town.slice(1)
}

// Placeholder image component
function PlaceholderImage() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] flex items-center justify-center">
      <div className="text-center p-4">
        <div className="text-4xl mb-2 opacity-30">📋</div>
        <p className="text-xs text-[#9B9B9B] font-medium">No photo yet</p>
      </div>
    </div>
  )
}

// Loading skeleton for cards
function CardSkeleton() {
  return (
    <div className="relative bg-white rounded-sm shadow-md overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function TownHomePageImproved() {
  const params = useParams()
  const townSlug = params.town as string
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [filteredBoards, setFilteredBoards] = useState<LocationWithPhoto[]>([])
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory | 'all'>('all')
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())

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

  const handleImageError = (boardId: string) => {
    setImageLoadErrors(prev => new Set(prev).add(boardId))
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
      <main className="min-h-screen bg-[#C4A574] relative">
        {/* Cork Board Texture Overlay - more subtle */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Simplified Header */}
        <header className="relative z-10 bg-white shadow-sm border-b border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[#2C2C2C] flex items-center justify-center gap-2">
                <span className="text-[#D94F4F]">📌</span>
                Switchboard
              </h1>
              <p className="text-lg text-[#6B6B6B] mt-1">
                What's posted in {townName}
              </p>
            </div>
          </div>
        </header>

        {/* Filter Bar - Better Visual Separation */}
        <div className="sticky top-0 z-20 bg-white shadow-md border-b border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Discovery Filter */}
            {allBoards.length > 0 && (
              <DiscoveryFilter 
                locations={allBoards} 
                onFilterChange={handleFilterChange}
              />
            )}
            
            {/* View Mode Toggle */}
            <div className="flex justify-center mt-4">
              <div className="inline-flex bg-[#F5F5F0] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-[#2C2C2C]'
                      : 'text-[#6B6B6B] hover:text-[#2C2C2C]'
                  }`}
                >
                  <span className="mr-2">⚏</span>Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'map'
                      ? 'bg-white shadow-sm text-[#2C2C2C]'
                      : 'text-[#6B6B6B] hover:text-[#2C2C2C]'
                  }`}
                >
                  <span className="mr-2">🗺️</span>Map
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            // Loading State with Skeleton Cards
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : viewMode === 'map' ? (
            // Map View
            <MapView locations={filteredBoards} />
          ) : filteredBoards.length === 0 && allBoards.length > 0 ? (
            // No Results State
            <div className="flex items-center justify-center py-20">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center"
                   style={{ transform: `rotate(${getRandomRotation()}deg)` }}>
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">
                  No boards found
                </h3>
                <p className="text-[#6B6B6B]">
                  No bulletin boards match "{activeCategory}" in {townName}. 
                  Try selecting "All" to see everything.
                </p>
                <button
                  onClick={() => setActiveCategory('all')}
                  className="mt-4 px-4 py-2 bg-[#D94F4F] text-white rounded-md hover:bg-[#C43F3F] transition-colors"
                >
                  Show All Boards
                </button>
              </div>
            </div>
          ) : (
            // Grid View - Improved Layout
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBoards.map((board) => {
                const rotation = getRandomRotation(board.id)
                const hasImageError = imageLoadErrors.has(board.id)
                
                return (
                  <Link
                    key={board.id}
                    href={`/${townSlug}/${board.slug}`}
                    className="group block"
                  >
                    <div 
                      className="relative bg-white rounded-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                      style={{ 
                        transform: `rotate(${rotation}deg)`,
                      }}
                    >
                      {/* Red pushpin for active items */}
                      {board.photo && !hasImageError && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="w-5 h-5 bg-[#D94F4F] rounded-full shadow-lg">
                            <div className="w-3 h-3 bg-white/30 rounded-full absolute top-1 left-1" />
                          </div>
                        </div>
                      )}
                      
                      {/* Image Container with Fixed Aspect Ratio */}
                      <div className="aspect-[4/3] bg-[#F5F5F0] overflow-hidden">
                        {board.photo && !hasImageError ? (
                          <Image 
                            src={getPhotoUrl(board.photo.storage_path)}
                            alt={board.name}
                            width={400}
                            height={300}
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => handleImageError(board.id)}
                          />
                        ) : (
                          <PlaceholderImage />
                        )}
                      </div>
                      
                      {/* Location Info - Cleaner Design */}
                      <div className="p-3 bg-white">
                        <h3 className="font-semibold text-[#2C2C2C] text-sm leading-tight mb-1 line-clamp-1">
                          {board.name}
                        </h3>
                        <p className="text-xs text-[#6B6B6B] line-clamp-1">
                          {board.address || 'View board'}
                        </p>
                        {board.photo && (
                          <p className="text-xs text-[#9B9B9B] mt-1">
                            Updated {new Date(board.photo.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Empty State - No Boards at All */}
          {!loading && allBoards.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">
                  No bulletin boards yet
                </h3>
                <p className="text-[#6B6B6B] mb-4">
                  {townName} doesn't have any bulletin boards posted yet. 
                  Be the first to add one!
                </p>
                <Link
                  href="/get-listed"
                  className="inline-block px-6 py-3 bg-[#D94F4F] text-white rounded-md hover:bg-[#C43F3F] transition-colors"
                >
                  Get Your Business Listed
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-[#E5E5E5] bg-white/50">
          <div className="text-center text-sm text-[#6B6B6B]">
            <p>The local news nobody's covering.</p>
            <p className="mt-1">Built by Rise Above Partners with support from Ofigona, LLC</p>
          </div>
        </footer>
      </main>
    </>
  )
}