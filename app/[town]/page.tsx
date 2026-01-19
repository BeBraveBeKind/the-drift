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

export default function TownHomePage() {
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
        {/* Cork Board Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Header with Cork Board Frame */}
        <header className="relative z-10 text-center pt-8 pb-6">
          <div className="max-w-md mx-auto px-4">
            <div className="relative inline-block">
              <div className="bg-[#8B7355] p-4 rounded-2xl shadow-xl">
                <div 
                  className="bg-[#FFFEF9] px-10 py-8 shadow-lg border-2 border-[#6B5A3C] rounded-xl"
                  style={{ 
                    boxShadow: 'inset 0 0 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <h1 className="text-[36px] font-bold text-[#2C2C2C] leading-[1.2] mb-3">
                    📌 Switchboard
                  </h1>
                  <p className="text-[18px] font-medium text-[#2C2C2C] leading-[1.4]">
                    What's posted in {townName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
          {/* Discovery Filter */}
          {allBoards.length > 0 && (
            <DiscoveryFilter 
              locations={allBoards} 
              onFilterChange={handleFilterChange}
            />
          )}
          
          {/* View Mode Toggle */}
          <div className="flex justify-center mt-4">
            <div className="bg-white border-2 border-[#2C2C2C] rounded-lg p-1 shadow-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#2C2C2C] text-white'
                    : 'text-[#2C2C2C] bg-[#F5F5F0] hover:bg-[#E5E5E5]'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                  viewMode === 'map'
                    ? 'bg-[#2C2C2C] text-white'
                    : 'text-[#2C2C2C] bg-[#F5F5F0] hover:bg-[#E5E5E5]'
                }`}
              >
                Map View
              </button>
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
            // Grid View - Polaroid Cards
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 max-w-6xl mx-auto justify-items-center">
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
                      className="relative bg-[#FFFEF9] p-2 border-[1px] border-[#E5E5E5] hover:shadow-xl transition-all duration-200 hover:-translate-y-1 w-full max-w-[160px] mx-auto"
                      style={{ 
                        transform: `rotate(${rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        borderRadius: '2px'
                      }}
                    >
                      {/* Pushpin */}
                      <div 
                        className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full shadow-sm transform -translate-x-1/2 z-10"
                        style={{ backgroundColor: '#2C2C2C' }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full absolute top-0.5 left-0.5"
                          style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                        />
                      </div>
                      
                      {/* Polaroid Photo Container */}
                      <div className="aspect-square bg-[#FDF6E3] border border-[#E5E5E5] mb-2 overflow-hidden">
                        {board.photo && !hasImageError ? (
                          <Image 
                            src={getPhotoUrl(board.photo.storage_path)}
                            alt={board.name}
                            width={150}
                            height={150}
                            sizes="150px"
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            onError={() => handleImageError(board.id)}
                          />
                        ) : (
                          <PlaceholderImage />
                        )}
                      </div>
                      
                      {/* Location Label */}
                      <div className="text-center">
                        <h3 className="text-[12px] font-semibold text-[#2C2C2C] leading-tight line-clamp-1">
                          {board.name}
                        </h3>
                        {board.photo && (
                          <p className="text-[10px] text-[#6B6B6B] mt-0.5">
                            {new Date(board.photo.created_at).toLocaleDateString()}
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