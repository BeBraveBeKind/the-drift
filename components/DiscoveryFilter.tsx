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

  const categoryEmojis: Record<string, string> = {
    'all': '📋',
    'events': '🎉', 
    'services': '🛠️',
    'community': '🤝',
    'for-sale': '💰',
    'food': '🍽️',
    'other': '📌'
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {/* All button with improved styling */}
      <button
        onClick={() => handleCategoryClick('all')}
        className={`
          relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
          ${activeCategory === 'all' 
            ? 'bg-white shadow-md transform -translate-y-0.5 scale-105' 
            : 'bg-white/80 hover:bg-white hover:shadow-sm'
          }
        `}
        style={{
          borderTop: activeCategory === 'all' ? '3px solid #2C2C2C' : '3px solid transparent',
        }}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{categoryEmojis['all']}</span>
          <span className={activeCategory === 'all' ? 'text-[#000000]' : 'text-[#2C2C2C]'}>
            All
          </span>
          <span className={`
            px-1.5 py-0.5 rounded-full text-xs font-semibold
            ${activeCategory === 'all' 
              ? 'bg-[#2C2C2C] text-white' 
              : 'bg-[#F5F5F0] text-[#2C2C2C] border border-[#2C2C2C]'
            }
          `}>
            {locations.length}
          </span>
        </span>
        
        {/* Active indicator - pushpin */}
        {activeCategory === 'all' && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="w-4 h-4 bg-[#2C2C2C] rounded-full shadow-sm">
              <div className="w-2 h-2 bg-white/40 rounded-full absolute top-0.5 left-0.5" />
            </div>
          </div>
        )}
      </button>
      
      {/* Category buttons with improved styling */}
      {DISCOVERY_CATEGORIES.map(category => {
        const count = categoryCounts[category]
        const isActive = activeCategory === category
        
        return (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            disabled={count === 0}
            className={`
              relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${isActive 
                ? 'bg-white shadow-md transform -translate-y-0.5 scale-105' 
                : 'bg-white/80 hover:bg-white hover:shadow-sm'
              }
              ${count === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'
              }
            `}
            style={{
              borderTop: isActive ? '3px solid #2C2C2C' : '3px solid transparent',
            }}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{categoryEmojis[category] || '📌'}</span>
              <span className={isActive ? 'text-[#000000]' : 'text-[#2C2C2C]'}>
                {DISCOVERY_CATEGORY_LABELS[category]}
              </span>
              {count > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded-full text-xs font-semibold
                  ${isActive 
                    ? 'bg-[#2C2C2C] text-white' 
                    : 'bg-[#F5F5F0] text-[#2C2C2C] border border-[#2C2C2C]'
                  }
                `}>
                  {count}
                </span>
              )}
            </span>
            
            {/* Active indicator - pushpin */}
            {isActive && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-[#2C2C2C] rounded-full shadow-sm">
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