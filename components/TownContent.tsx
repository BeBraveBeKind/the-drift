'use client'

import { Fragment, useState } from 'react'
import BoardCard from '@/components/BoardCard'
import DiscoveryFilter from '@/components/DiscoveryFilter'
import MapView from '@/components/MapView'
import Interruptor from '@/components/Interruptor'
import type { LocationWithPhoto } from '@/types'
import type { DiscoveryCategory } from '@/lib/businessProfiles'

interface TownContentProps {
  boards: LocationWithPhoto[]
  townSlug: string
  townName: string
}

export default function TownContent({ boards, townSlug, townName }: TownContentProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [filteredBoards, setFilteredBoards] = useState<LocationWithPhoto[]>(boards)
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory | 'all'>('all')

  const handleFilterChange = (filtered: LocationWithPhoto[], category: DiscoveryCategory | 'all') => {
    setFilteredBoards(filtered)
    setActiveCategory(category)
  }

  return (
    <>
      {/* Discovery Filter */}
      {boards.length > 0 && (
        <DiscoveryFilter
          locations={boards}
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
        {viewMode === 'grid' ? (
          filteredBoards.length === 0 && boards.length > 0 ? (
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
                  {/* Interruptor after first row (2 cards on 2-col grid) */}
                  {index === 1 && <Interruptor townName={townName} />}
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
    </>
  )
}
