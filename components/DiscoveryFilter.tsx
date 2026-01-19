'use client'

import { useState } from 'react'
import { 
  DISCOVERY_CATEGORIES, 
  DISCOVERY_CATEGORY_LABELS, 
  getDiscoveryCategories,
  type DiscoveryCategory 
} from '@/lib/businessProfiles'
import type { LocationWithPhoto } from '@/types'

interface DiscoveryFilterProps {
  locations: LocationWithPhoto[]
  onFilterChange: (filteredLocations: LocationWithPhoto[], activeCategory: DiscoveryCategory | 'all') => void
}

export default function DiscoveryFilter({ locations, onFilterChange }: DiscoveryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory | 'all'>('all')

  // Count locations by category
  const categoryCounts = DISCOVERY_CATEGORIES.reduce((counts, category) => {
    counts[category] = locations.filter(location => {
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
      const filtered = locations.filter(location => {
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
    <div className="relative z-10 max-w-6xl mx-auto px-4 mb-6">
      <div className="flex justify-center">
        <div className="bg-[#FFFEF9] border-[1px] border-[#E5E5E5] rounded-lg p-2 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {/* All button */}
            <button
              onClick={() => handleCategoryClick('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#D94F4F] text-white'
                  : 'text-[#6B6B6B] hover:text-[#2C2C2C] hover:bg-[#F8F9FA]'
              }`}
            >
              All ({locations.length})
            </button>
            
            {/* Category buttons */}
            {DISCOVERY_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-[#D94F4F] text-white'
                    : 'text-[#6B6B6B] hover:text-[#2C2C2C] hover:bg-[#F8F9FA]'
                }`}
                disabled={categoryCounts[category] === 0}
              >
                {DISCOVERY_CATEGORY_LABELS[category]} ({categoryCounts[category]})
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {activeCategory !== 'all' && (
        <div className="text-center mt-3">
          <p className="text-[#6B6B6B] text-sm">
            Showing {categoryCounts[activeCategory]} locations in {DISCOVERY_CATEGORY_LABELS[activeCategory].toLowerCase()}
          </p>
        </div>
      )}
    </div>
  )
}