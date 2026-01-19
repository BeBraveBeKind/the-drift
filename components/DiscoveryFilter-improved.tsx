'use client'

import { useState, useEffect } from 'react'
import { getBusinessProfilesByCategory, type DiscoveryCategory } from '@/lib/businessProfiles'
import type { LocationWithPhoto } from '@/types'

interface DiscoveryFilterProps {
  locations: LocationWithPhoto[]
  onFilterChange: (filtered: LocationWithPhoto[], category: DiscoveryCategory | 'all') => void
}

const categories: { value: DiscoveryCategory | 'all', label: string, emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '📋' },
  { value: 'events', label: 'Events', emoji: '🎉' },
  { value: 'services', label: 'Services', emoji: '🛠️' },
  { value: 'community', label: 'Community', emoji: '🤝' },
  { value: 'for-sale', label: 'For Sale', emoji: '💰' },
  { value: 'food', label: 'Food', emoji: '🍽️' },
  { value: 'other', label: 'Other', emoji: '📌' }
]

export default function DiscoveryFilterImproved({ locations, onFilterChange }: DiscoveryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory | 'all'>('all')
  const [counts, setCounts] = useState<Record<string, number>>({})

  // Calculate counts for each category
  useEffect(() => {
    const newCounts: Record<string, number> = { all: locations.length }
    
    categories.forEach(cat => {
      if (cat.value !== 'all') {
        const categoryLocations = getBusinessProfilesByCategory(locations, cat.value)
        newCounts[cat.value] = categoryLocations.length
      }
    })
    
    setCounts(newCounts)
  }, [locations])

  const handleCategoryClick = (category: DiscoveryCategory | 'all') => {
    setActiveCategory(category)
    
    if (category === 'all') {
      onFilterChange(locations, category)
    } else {
      const filtered = getBusinessProfilesByCategory(locations, category)
      onFilterChange(filtered, category)
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map((category) => {
        const isActive = activeCategory === category.value
        const count = counts[category.value] || 0
        
        return (
          <button
            key={category.value}
            onClick={() => handleCategoryClick(category.value)}
            disabled={count === 0 && category.value !== 'all'}
            className={`
              relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${isActive 
                ? 'bg-white shadow-md transform -translate-y-0.5 scale-105' 
                : 'bg-white/80 hover:bg-white hover:shadow-sm'
              }
              ${count === 0 && category.value !== 'all' 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'
              }
            `}
            style={{
              borderTop: isActive ? '3px solid #D94F4F' : '3px solid transparent',
            }}
          >
            {/* Tab content */}
            <span className="flex items-center gap-2">
              <span className="text-lg">{category.emoji}</span>
              <span className={isActive ? 'text-[#2C2C2C]' : 'text-[#6B6B6B]'}>
                {category.label}
              </span>
              {count > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded-full text-xs font-semibold
                  ${isActive 
                    ? 'bg-[#D94F4F] text-white' 
                    : 'bg-[#F5F5F0] text-[#6B6B6B]'
                  }
                `}>
                  {count}
                </span>
              )}
            </span>
            
            {/* Active indicator - pushpin */}
            {isActive && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-[#D94F4F] rounded-full shadow-sm">
                  <div className="w-2 h-2 bg-white/40 rounded-full absolute top-0.5 left-0.5" />
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}