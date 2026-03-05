'use client'

import { useState } from 'react'
import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_CATEGORY_LABELS,
  getDiscoveryCategories,
  type DiscoveryCategory,
} from '@/lib/businessProfiles'
import type { LocationWithPhoto } from '@/types'

/**
 * DiscoveryFilter — Switchboard Design System
 *
 * Category chips using filter-chip classes.
 * Amber Gold active state, warm gray inactive.
 */

interface DiscoveryFilterProps {
  locations: LocationWithPhoto[]
  onFilterChange: (filteredLocations: LocationWithPhoto[], activeCategory: DiscoveryCategory | 'all') => void
}

export default function DiscoveryFilter({ locations, onFilterChange }: DiscoveryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory | 'all'>('all')

  const categoryCounts = DISCOVERY_CATEGORIES.reduce((counts, category) => {
    counts[category] = locations.filter((location) => {
      const categories = getDiscoveryCategories(
        location.business_category as any,
        location.business_tags || []
      )
      return categories.includes(category)
    }).length
    return counts
  }, {} as Record<DiscoveryCategory, number>)

  const handleCategoryClick = (category: DiscoveryCategory | 'all') => {
    setActiveCategory(category)

    if (category === 'all') {
      onFilterChange(locations, 'all')
    } else {
      const filtered = locations.filter((location) => {
        const categories = getDiscoveryCategories(
          location.business_category as any,
          location.business_tags || []
        )
        return categories.includes(category)
      })
      onFilterChange(filtered, category)
    }
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 mb-6">
      <div className="filter-group justify-center">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`filter-chip ${activeCategory === 'all' ? 'filter-chip--active' : ''}`}
        >
          All ({locations.length})
        </button>

        {DISCOVERY_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`filter-chip ${activeCategory === category ? 'filter-chip--active' : ''}`}
            disabled={categoryCounts[category] === 0}
            style={categoryCounts[category] === 0 ? { opacity: 0.4, cursor: 'default' } : undefined}
          >
            {DISCOVERY_CATEGORY_LABELS[category]} ({categoryCounts[category]})
          </button>
        ))}
      </div>

      {activeCategory !== 'all' && (
        <p
          className="text-center mt-3 text-sm"
          style={{ color: 'var(--sb-stone)' }}
        >
          Showing {categoryCounts[activeCategory]} in {DISCOVERY_CATEGORY_LABELS[activeCategory].toLowerCase()}
        </p>
      )}
    </div>
  )
}
