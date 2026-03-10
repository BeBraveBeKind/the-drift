'use client'

import { Fragment, useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useLocations } from '@/hooks/useLocations'
import Navigation from '@/components/Navigation'
import BoardCard from '@/components/BoardCard'
import DiscoveryFilter from '@/components/DiscoveryFilter'
import MapView from '@/components/MapView'
import Interruptor from '@/components/Interruptor'
import SteveCTA from '@/components/SteveCTA'
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
        {/* Hero banner */}
        <header className="max-w-[640px] mx-auto px-4 pt-4 pb-2">
          <div
            className="relative overflow-hidden"
            style={{ borderRadius: 'var(--sb-radius)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-banner.webp"
              alt=""
              className="w-full h-auto"
              width={640}
              height={280}
              style={{ display: 'block' }}
            />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
              style={{
                background: 'rgba(30,41,59,0.65)',
              }}
            >
              <p
                className="text-xs sm:text-sm font-light uppercase tracking-widest mb-1"
                style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.15em' }}
              >
                Welcome to
              </p>
              <h1
                className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1"
                style={{ color: '#F59E0B' }}
              >
                Switchboard
              </h1>
              <p
                className="text-sm sm:text-base font-light"
                style={{ color: 'rgba(255,255,255,0.85)' }}
              >
                What&rsquo;s posted in {townName}
              </p>
            </div>
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
                  <Fragment key={board.id}>
                    <BoardCard
                      board={board}
                      townSlug={townSlug}
                      index={index}
                    />
                    {/* Interruptor after row 2 (~6 cards) */}
                    {index === 5 && <Interruptor />}
                  </Fragment>
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

        {/* Steve CTA */}
        <div className="max-w-[640px] mx-auto px-4">
          <SteveCTA />
        </div>

        <div className="max-w-[640px] mx-auto px-4">
          <Footer />
        </div>
      </main>
    </>
  )
}
