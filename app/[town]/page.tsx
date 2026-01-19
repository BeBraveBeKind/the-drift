'use client'

import { useState, useEffect } from 'react'
import { getPhotoUrl } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, notFound } from 'next/navigation'
import { useLocations } from '@/hooks/useLocations'
import DiscoveryFilter from '@/components/DiscoveryFilter'
import MapView from '@/components/MapView'
import type { LocationWithPhoto } from '@/types'
import type { DiscoveryCategory } from '@/lib/businessProfiles'

// Memoize random values to prevent layout shifts
const cardRotations = new Map<string, number>()
const cardPushpinColors = new Map<string, string>()

// Random rotation for cards
function getRandomRotation(id?: string) {
  if (id && cardRotations.has(id)) {
    return cardRotations.get(id)!
  }
  const rotation = Math.random() * 6 - 3 // -3 to +3 degrees
  if (id) cardRotations.set(id, rotation)
  return rotation
}

// Pushpin colors from style guide
const pushpinColors = [
  '#D94F4F', // Pushpin Red
  '#F4D03F', // Pushpin Yellow  
  '#5B9BD5', // Pushpin Blue
  '#6BBF59'  // Pushpin Green
]

function getRandomPushpinColor(id?: string) {
  if (id && cardPushpinColors.has(id)) {
    return cardPushpinColors.get(id)!
  }
  const color = pushpinColors[Math.floor(Math.random() * pushpinColors.length)]
  if (id) cardPushpinColors.set(id, color)
  return color
}

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
    return <div className="min-h-screen bg-[#C4A574]" />
  }

  return (
    <main className="min-h-screen bg-[#C4A574] relative">
      {/* Cork Board Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Header - Pinned Note Style */}
      <header className="relative z-10 text-center pt-8 pb-4">
        <div className="max-w-md mx-auto">
          {/* Main Title on Paper */}
          <div className="relative inline-block">
            <div 
              className="bg-[#FFFEF9] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              }}
            >
              <h1 className="text-[32px] font-bold text-[#2C2C2C] leading-[1.2] mb-2">
                Switchboard
              </h1>
              <p className="text-[16px] font-medium text-[#6B6B6B] leading-[1.4]">
                What's posted in {townName}
              </p>
              
              {/* Pushpin at top */}
              <div 
                className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2"
                style={{ backgroundColor: getRandomPushpinColor() }}
              >
                <div 
                  className="w-3 h-3 rounded-full absolute top-1 left-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* What Is This Callout */}
      <div className="relative z-10 text-center mb-6">
        <Link href="/about" className="inline-block group">
          <div 
            className="bg-[#F4D03F] p-3 px-6 shadow-lg border-[1px] border-[#E5E5E5] relative mx-auto"
            style={{ 
              transform: `rotate(${getRandomRotation()}deg)`,
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              borderRadius: '2px'
            }}
          >
            <div className="text-[14px] font-semibold text-[#2C2C2C] group-hover:text-[#1a1a1a] transition-colors">
              👁️ WHAT IS THIS?
            </div>
            
            {/* Pushpin */}
            <div 
              className="absolute -top-2 left-1/2 w-4 h-4 rounded-full shadow-sm transform -translate-x-1/2"
              style={{ backgroundColor: '#D94F4F' }}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full absolute top-0.5 left-0.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
            </div>
          </div>
        </Link>
      </div>

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
          <div className="bg-[#FFFEF9] border-[1px] border-[#E5E5E5] rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#D94F4F] text-white'
                  : 'text-[#6B6B6B] hover:text-[#2C2C2C]'
              }`}
            >
              📌 Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-[#D94F4F] text-white'
                  : 'text-[#6B6B6B] hover:text-[#2C2C2C]'
              }`}
            >
              🗺️ Map
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
              <div className="relative inline-block">
                <div 
                  className="bg-[#FFFEF9] p-8 shadow-lg border-[1px] border-[#E5E5E5] relative mx-auto"
                  style={{ 
                    transform: `rotate(${getRandomRotation()}deg)`,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    borderRadius: '2px'
                  }}
                >
                  <h3 className="text-[20px] font-bold text-[#2C2C2C] leading-[1.3] mb-3">
                    🔍 No boards found
                  </h3>
                  <p className="text-[14px] text-[#2C2C2C] leading-[1.4] max-w-sm">
                    No bulletin boards match this category in {townName}. Try selecting "All" to see all boards.
                  </p>
                  
                  {/* Pushpin */}
                  <div 
                    className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2"
                    style={{ backgroundColor: '#D94F4F' }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full absolute top-1 left-1"
                      style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div className="max-w-[1200px] mx-auto">
            {/* Mobile: Fixed 2-column grid with exact card widths */}
            <div className="md:hidden grid gap-4 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fill, 160px)' }}>
              {filteredBoards.map((board, index) => {
                const rotation = getRandomRotation(board.id)
                const pushpinColor = getRandomPushpinColor(board.id)
                
                return (
                  <Link
                    key={board.id}
                    href={`/${townSlug}/${board.slug}`}
                    className="group block"
                  >
                    <div 
                      className="relative w-40 bg-[#FFFEF9] p-2 border-[1px] border-[#E5E5E5] hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                      style={{ 
                        transform: `rotate(${rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        borderRadius: '2px'
                      }}
                    >
                      {/* Pushpin */}
                      <div 
                        className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2 z-10"
                        style={{ backgroundColor: pushpinColor }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full absolute top-1 left-1"
                          style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                        />
                      </div>
                      
                      {/* Fixed square thumbnail area */}
                      <div className="w-36 h-36 bg-[#FDF6E3] border-2 border-[#E5E5E5] mb-3 p-2 overflow-hidden mx-auto">
                        <div className="w-full h-full bg-white border border-[#E5E5E5] overflow-hidden">
                          {board.photo ? (
                            <Image 
                              src={getPhotoUrl(board.photo.storage_path)}
                              alt={board.name}
                              width={144}
                              height={144}
                              sizes="144px"
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                              priority={index < 6}
                              loading={index < 6 ? "eager" : "lazy"}
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
                            />
                          ) : (
                            <div className="w-full h-full bg-[#FDF6E3] flex items-center justify-center">
                              <span className="text-3xl opacity-20 text-[#C4A574]">📌</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Card Text Content */}
                      <div className="text-left px-1">
                        <h3 className="text-[14px] font-semibold text-[#2C2C2C] leading-[1.3] mb-1 line-clamp-2">
                          {board.name}
                        </h3>
                        <p className="text-[11px] text-[#6B6B6B] leading-[1.2]">
                          {board.photo 
                            ? `Updated: ${new Date(board.photo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                            : 'No photo yet'
                          }
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            
            {/* Desktop: Fixed grid with exact card widths */}
            <div 
              className="hidden md:grid gap-4 justify-center"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, 200px)'
              }}
            >
              {filteredBoards.map((board, index) => {
                const rotation = getRandomRotation(board.id)
                const pushpinColor = getRandomPushpinColor(board.id)
                
                return (
                  <Link
                    key={board.id}
                    href={`/${townSlug}/${board.slug}`}
                    className="group block"
                  >
                    <div 
                      className="relative w-50 bg-[#FFFEF9] p-2 border-[1px] border-[#E5E5E5] hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                      style={{ 
                        transform: `rotate(${rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        borderRadius: '2px'
                      }}
                    >
                      {/* Pushpin */}
                      <div 
                        className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2 z-10"
                        style={{ backgroundColor: pushpinColor }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full absolute top-1 left-1"
                          style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                        />
                      </div>
                      
                      {/* Fixed square thumbnail area */}
                      <div className="w-44 h-44 bg-[#FDF6E3] border-2 border-[#E5E5E5] mb-3 p-2 overflow-hidden mx-auto">
                        <div className="w-full h-full bg-white border border-[#E5E5E5] overflow-hidden">
                          {board.photo ? (
                            <Image 
                              src={getPhotoUrl(board.photo.storage_path)}
                              alt={board.name}
                              width={144}
                              height={144}
                              sizes="144px"
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                              priority={index < 6}
                              loading={index < 6 ? "eager" : "lazy"}
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
                            />
                          ) : (
                            <div className="w-full h-full bg-[#FDF6E3] flex items-center justify-center">
                              <span className="text-3xl opacity-20 text-[#C4A574]">📌</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Card Text Content */}
                      <div className="text-left px-1">
                        <h3 className="text-[14px] font-semibold text-[#2C2C2C] leading-[1.3] mb-1 line-clamp-2">
                          {board.name}
                        </h3>
                        <p className="text-[11px] text-[#6B6B6B] leading-[1.2]">
                          {board.photo 
                            ? `Updated: ${new Date(board.photo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                            : 'No photo yet'
                          }
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
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
      
      <footer className="mt-16 py-8 border-t border-stone-200 text-center text-sm text-stone-400">
        <p>The local news nobody's covering.</p>
        <p className="mt-1">Built by Rise Above Partners with support from Ofigona, LLC</p>
      </footer>
    </main>
  )
}