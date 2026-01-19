'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getPhotoUrl, timeAgo } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, notFound } from 'next/navigation'

interface Board {
  id: string
  name: string
  slug: string
  address: string
  town: string
  town_id: string
  view_count: number
  updated_at: string
  photo: {
    id: string
    storage_path: string
    created_at: string
  } | null
}

// Random rotation for cards
function getRandomRotation() {
  return Math.random() * 6 - 3 // -3 to +3 degrees
}

// Pushpin colors from style guide
const pushpinColors = [
  '#D94F4F', // Pushpin Red
  '#F4D03F', // Pushpin Yellow  
  '#5B9BD5', // Pushpin Blue
  '#6BBF59'  // Pushpin Green
]

function getRandomPushpinColor() {
  return pushpinColors[Math.floor(Math.random() * pushpinColors.length)]
}

// Format town name for display
function formatTownName(town: string) {
  return town.charAt(0).toUpperCase() + town.slice(1)
}

export default function TownHomePage() {
  const params = useParams()
  const townSlug = params.town as string
  const [townName, setTownName] = useState(formatTownName(townSlug))
  
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  useEffect(() => {
    setMounted(true)
    loadBoards()
  }, [townSlug])

  async function loadBoards() {
    // First get the town by slug to get its ID
    const { data: townData } = await supabase
      .from('towns')
      .select('id, name, slug')
      .eq('slug', townSlug)
      .eq('is_active', true)
      .single()
    
    if (!townData) {
      setLoading(false)
      notFound()
      return
    }
    
    setTownName(townData.name)
    
    const { data: locations } = await supabase
      .from('locations')
      .select('id, name, slug, address, town, town_id, view_count, updated_at')
      .eq('is_active', true)
      .eq('town_id', townData.id)
      .order('updated_at', { ascending: false })
    
    if (!locations) {
      setLoading(false)
      return
    }
    
    const boardsWithPhotos = await Promise.all(
      locations.map(async (location) => {
        const { data: photo } = await supabase
          .from('photos')
          .select('id, storage_path, created_at')
          .eq('location_id', location.id)
          .eq('is_current', true)
          .eq('is_flagged', false)
          .single()
        
        return { ...location, photo }
      })
    )
    
    // Sort by most recent photo/update
    const sorted = boardsWithPhotos.sort((a, b) => {
      const dateA = a.photo ? new Date(a.photo.created_at).getTime() : new Date(a.updated_at).getTime()
      const dateB = b.photo ? new Date(b.photo.created_at).getTime() : new Date(b.updated_at).getTime()
      return dateB - dateA
    })
    
    setBoards(sorted)
    setLoading(false)
  }
  
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
          <div className="max-w-[1200px] mx-auto">
            {/* Mobile: Fixed 2-column grid with exact card widths */}
            <div className="md:hidden grid gap-4 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fill, 160px)' }}>
              {boards.map((board) => {
                const rotation = getRandomRotation()
                const pushpinColor = getRandomPushpinColor()
                
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
              {boards.map((board) => {
                const rotation = getRandomRotation()
                const pushpinColor = getRandomPushpinColor()
                
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
        ) : (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div 
                className="bg-[#F4D03F] p-8 shadow-lg border-[1px] border-[#E5E5E5] relative mx-auto"
                style={{ 
                  transform: `rotate(${getRandomRotation()}deg)`,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  borderRadius: '2px'
                }}
              >
                <h3 className="text-[24px] font-bold text-[#2C2C2C] leading-[1.3] mb-3">
                  🗺️ Coming Soon
                </h3>
                <p className="text-[14px] text-[#2C2C2C] leading-[1.4] max-w-sm">
                  Map view is in the works! For now, use the grid to browse all community boards.
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
        )}
      </section>
      
      <footer className="mt-16 py-8 border-t border-stone-200 text-center text-sm text-stone-400">
        <p>The local news nobody's covering.</p>
        <p className="mt-1">Built by Rise Above Partners with support from Ofigona, LLC</p>
      </footer>
    </main>
  )
}