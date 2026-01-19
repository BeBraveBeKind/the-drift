'use client'

import { BUSINESS_CATEGORY_LABELS, getDiscoveryCategories, DISCOVERY_CATEGORY_LABELS, type BusinessCategory } from '@/lib/businessProfiles'

interface BusinessProfileDisplayProps {
  businessCategory?: string | null
  businessTags?: string[]
  className?: string
}

export default function BusinessProfileDisplay({ 
  businessCategory, 
  businessTags = [],
  className = ""
}: BusinessProfileDisplayProps) {
  if (!businessCategory && businessTags.length === 0) {
    return null
  }

  const categories = getDiscoveryCategories(
    businessCategory as BusinessCategory,
    businessTags
  )

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Business Category */}
      {businessCategory && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Business type:</span>
          <span className="bg-[#6BBF59] text-white px-3 py-1 rounded-full text-sm font-medium">
            {BUSINESS_CATEGORY_LABELS[businessCategory as BusinessCategory] || businessCategory}
          </span>
        </div>
      )}

      {/* Discovery Categories */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-stone-500">Categories:</span>
          {categories.map(category => (
            <span 
              key={category}
              className="bg-[#5B9BD5] text-white px-2 py-1 rounded-full text-xs font-medium"
            >
              {DISCOVERY_CATEGORY_LABELS[category]}
            </span>
          ))}
        </div>
      )}

      {/* Business Tags */}
      {businessTags.length > 0 && (
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-sm text-stone-500 mt-1">Content:</span>
          <div className="flex flex-wrap gap-1">
            {businessTags.map(tag => (
              <span 
                key={tag}
                className="bg-stone-100 text-stone-700 px-2 py-1 rounded-full text-xs border border-stone-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}