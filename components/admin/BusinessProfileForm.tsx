'use client'

import { useState } from 'react'
import type { BusinessProfileFormData } from '@/types'
import { 
  BUSINESS_CATEGORIES, 
  BUSINESS_CATEGORY_LABELS, 
  SUGGESTED_TAGS_BY_CATEGORY,
  PRESET_TAGS,
  normalizeTag,
  type BusinessCategory 
} from '@/lib/businessProfiles'

interface BusinessProfileFormProps {
  initialData?: Partial<BusinessProfileFormData>
  onSubmit: (data: BusinessProfileFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  disabled?: boolean
}

export default function BusinessProfileForm({
  initialData = {},
  onSubmit,
  onCancel,
  isEditing = false,
  disabled = false
}: BusinessProfileFormProps) {
  const [category, setCategory] = useState<string>(initialData.business_category || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData.business_tags || [])
  const [customTag, setCustomTag] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    
    // Show AI suggestions when category is selected
    if (newCategory && SUGGESTED_TAGS_BY_CATEGORY[newCategory as BusinessCategory]) {
      setShowSuggestions(true)
    }
  }

  const handleTagToggle = (tag: string) => {
    const normalizedTag = normalizeTag(tag)
    if (selectedTags.includes(normalizedTag)) {
      setSelectedTags(selectedTags.filter(t => t !== normalizedTag))
    } else {
      setSelectedTags([...selectedTags, normalizedTag])
    }
  }

  const handleAddCustomTag = () => {
    if (!customTag.trim()) return
    
    const normalizedTag = normalizeTag(customTag)
    if (!selectedTags.includes(normalizedTag)) {
      setSelectedTags([...selectedTags, normalizedTag])
    }
    setCustomTag('')
  }

  const handleAcceptSuggestions = () => {
    if (!category) return
    
    const suggestions = SUGGESTED_TAGS_BY_CATEGORY[category as BusinessCategory] || []
    const newTags = suggestions.filter(tag => !selectedTags.includes(tag))
    setSelectedTags([...selectedTags, ...newTags])
    setShowSuggestions(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || selectedTags.length === 0) return
    
    onSubmit({
      business_category: category,
      business_tags: selectedTags
    })
  }

  const suggestedTags = category ? SUGGESTED_TAGS_BY_CATEGORY[category as BusinessCategory] || [] : []
  const isSubmitDisabled = !category || selectedTags.length === 0 || disabled

  return (
    <div className="bg-[#FFFEF9] p-6 rounded-lg border border-[#E5E5E5] shadow-sm">
      <h2 className="text-[18px] font-semibold text-[#2C2C2C] mb-4">
        {isEditing ? 'Edit Business Profile' : 'Business Profile Setup'}
      </h2>
      
      <p className="text-[14px] text-[#6B6B6B] mb-6">
        Help visitors discover your bulletin board by selecting your business type and the kinds of content typically posted.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Category */}
        <div>
          <label className="block text-[14px] font-medium text-[#2C2C2C] mb-2">
            What type of business is this? *
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
            disabled={disabled}
          >
            <option value="">Select a category...</option>
            {BUSINESS_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {BUSINESS_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* AI Tag Suggestions */}
        {showSuggestions && suggestedTags.length > 0 && (
          <div className="bg-[#F4D03F] bg-opacity-20 border border-[#F4D03F] rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-medium text-[#2C2C2C] mb-1">
                  🤖 AI Suggestions for {BUSINESS_CATEGORY_LABELS[category as BusinessCategory]}
                </h3>
                <p className="text-[12px] text-[#6B6B6B]">
                  Based on what typically appears on {BUSINESS_CATEGORY_LABELS[category as BusinessCategory].toLowerCase()} bulletin boards
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="text-[#6B6B6B] hover:text-[#2C2C2C] text-[20px]"
              >
                ×
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2 py-1 rounded-full text-[12px] border ${
                    selectedTags.includes(tag)
                      ? 'bg-[#D94F4F] text-white border-[#D94F4F]'
                      : 'bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#D94F4F]'
                  }`}
                  disabled={disabled}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAcceptSuggestions}
                className="bg-[#6BBF59] text-white px-3 py-1 rounded text-[12px] hover:bg-[#5da850] transition-colors"
                disabled={disabled}
              >
                Accept All Suggestions
              </button>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded text-[12px] hover:bg-gray-600 transition-colors"
                disabled={disabled}
              >
                Skip Suggestions
              </button>
            </div>
          </div>
        )}

        {/* Content Tags */}
        <div>
          <label className="block text-[14px] font-medium text-[#2C2C2C] mb-2">
            What kind of content typically appears on your board? *
          </label>
          <p className="text-[12px] text-[#6B6B6B] mb-3">
            Select 3-8 tags that describe what people usually post. This helps visitors find relevant boards.
          </p>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mb-4">
              <p className="text-[12px] text-[#6B6B6B] mb-2">Selected ({selectedTags.length}):</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className="bg-[#D94F4F] text-white px-3 py-1 rounded-full text-[12px] hover:bg-[#c44545] transition-colors flex items-center gap-1"
                    disabled={disabled}
                  >
                    {tag}
                    <span>×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preset Tags by Category */}
          <div className="space-y-4">
            {Object.entries(PRESET_TAGS).map(([categoryName, tags]) => (
              <div key={categoryName}>
                <h4 className="text-[12px] font-medium text-[#2C2C2C] mb-2 capitalize">
                  {categoryName.replace('-', ' ')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-2 py-1 rounded-full text-[12px] border ${
                        selectedTags.includes(tag)
                          ? 'bg-[#D94F4F] text-white border-[#D94F4F]'
                          : 'bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#D94F4F]'
                      }`}
                      disabled={disabled}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Tag Input */}
          <div className="mt-4">
            <label className="block text-[12px] font-medium text-[#2C2C2C] mb-2">
              Add custom tag:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="e.g., pottery-class"
                className="flex-1 p-2 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomTag()
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="bg-[#5B9BD5] text-white px-3 py-2 rounded-md text-[12px] hover:bg-[#4a8bc2] transition-colors"
                disabled={disabled || !customTag.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#E5E5E5]">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="bg-[#6BBF59] text-white px-6 py-2 rounded-md font-semibold text-[14px] hover:bg-[#5da850] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Update Profile' : 'Complete Setup'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold text-[14px] hover:bg-gray-600 transition-colors"
              disabled={disabled}
            >
              Cancel
            </button>
          )}
        </div>

        {selectedTags.length > 0 && (
          <p className="text-[12px] text-[#6B6B6B]">
            💡 Tip: Choose {selectedTags.length < 3 ? '2-5 more' : selectedTags.length > 8 ? 'fewer' : 'just right!'} tags to help people find your board
          </p>
        )}
      </form>
    </div>
  )
}