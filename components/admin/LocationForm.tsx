'use client'

import { useState } from 'react'
import type { LocationFormData, Town, BusinessProfileFormData } from '@/types'
import BusinessProfileForm from './BusinessProfileForm'

interface LocationFormProps {
  form: LocationFormData
  towns: Town[]
  isEditing: boolean
  onFormChange: (form: LocationFormData) => void
  onSubmit: () => void
  onCancel: () => void
  disabled?: boolean
}

export default function LocationForm({
  form,
  towns,
  isEditing,
  onFormChange,
  onSubmit,
  onCancel,
  disabled = false
}: LocationFormProps) {
  const [showProfileForm, setShowProfileForm] = useState(false)
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    onFormChange({
      ...form,
      name,
      slug: isEditing ? form.slug : generateSlug(name)
    })
  }

  const handleProfileSubmit = (profileData: BusinessProfileFormData) => {
    onFormChange({
      ...form,
      business_category: profileData.business_category,
      business_tags: profileData.business_tags
    })
    setShowProfileForm(false)
  }

  const isSubmitDisabled = !form.name.trim() || !form.slug.trim() || !form.town_id || disabled
  const hasProfile = !!(form.business_category && form.business_tags && form.business_tags.length > 0)

  return (
    <div className="p-6 rounded-lg" style={{ background: 'var(--sb-white)', border: '1px solid var(--sb-warm-gray)' }}>
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--sb-charcoal)' }}>
        {isEditing ? 'Edit Location' : 'Add New Location'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[14px] font-medium text-[var(--sb-charcoal)] mb-1">
            Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full p-3 border border-[var(--sb-warm-gray)] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--sb-amber)]"
            placeholder="Business name"
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="block text-[14px] font-medium text-[var(--sb-charcoal)] mb-1">
            Slug *
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => onFormChange({ ...form, slug: e.target.value })}
            className="w-full p-3 border border-[var(--sb-warm-gray)] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--sb-amber)]"
            placeholder="url-friendly-name"
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="block text-[14px] font-medium text-[var(--sb-charcoal)] mb-1">
            Town *
          </label>
          <select
            value={form.town_id}
            onChange={(e) => onFormChange({ ...form, town_id: e.target.value })}
            className="w-full p-3 border border-[var(--sb-warm-gray)] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--sb-amber)]"
            disabled={disabled}
          >
            {towns.map(town => (
              <option key={town.id} value={town.id}>{town.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-[14px] font-medium text-[var(--sb-charcoal)] mb-1">
            Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => onFormChange({ ...form, address: e.target.value })}
            className="w-full p-3 border border-[var(--sb-warm-gray)] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--sb-amber)]"
            placeholder="123 Main St"
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="block text-[14px] font-medium text-[var(--sb-charcoal)] mb-1">
            Latitude
            <span className="text-[11px] text-[var(--sb-stone)] ml-2">(for map view)</span>
          </label>
          <input
            type="number"
            step="0.00000001"
            value={form.latitude || ''}
            onChange={(e) => onFormChange({ ...form, latitude: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full p-3 border border-[var(--sb-warm-gray)] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--sb-amber)]"
            placeholder="43.5569"
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="block text-[14px] font-medium text-[var(--sb-charcoal)] mb-1">
            Longitude
            <span className="text-[11px] text-[var(--sb-stone)] ml-2">(for map view)</span>
          </label>
          <input
            type="number"
            step="0.00000001"
            value={form.longitude || ''}
            onChange={(e) => onFormChange({ ...form, longitude: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full p-3 border border-[var(--sb-warm-gray)] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--sb-amber)]"
            placeholder="-90.8885"
            disabled={disabled}
          />
        </div>
        
        <div className="md:col-span-2 text-[12px] text-[var(--sb-stone)] -mt-2">
          💡 Get coordinates from Google Maps: Right-click on location → "What's here?" → Click coordinates to copy
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-[14px] font-medium text-[var(--sb-charcoal)] mb-1">
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => onFormChange({ ...form, description: e.target.value })}
            className="w-full p-3 border border-[var(--sb-warm-gray)] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--sb-amber)]"
            placeholder="Optional description"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Business Profile Section */}
      <div className="mt-6 pt-6 border-t border-[var(--sb-warm-gray)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[16px] font-medium text-[var(--sb-charcoal)]">Business Profile</h3>
            <p className="text-[12px] text-[var(--sb-stone)] mt-1">
              Help visitors discover this location by category and content
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowProfileForm(!showProfileForm)}
            className="btn-primary text-sm"
            disabled={disabled}
          >
            {hasProfile ? 'Edit Profile' : 'Setup Profile'}
          </button>
        </div>

        {hasProfile && !showProfileForm && (
          <div className="bg-[#F8F9FA] p-4 rounded-lg border border-[var(--sb-warm-gray)]">
            <div className="flex items-center gap-3">
              <span className="bg-[#6BBF59] text-white px-2 py-1 rounded text-[12px] font-medium">
                {form.business_category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <div className="flex flex-wrap gap-1">
                {form.business_tags?.slice(0, 5).map(tag => (
                  <span key={tag} className="bg-[#E5E5E5] text-[var(--sb-charcoal)] px-2 py-1 rounded-full text-[11px]">
                    {tag}
                  </span>
                ))}
                {form.business_tags && form.business_tags.length > 5 && (
                  <span className="text-[var(--sb-stone)] text-[11px]">
                    +{form.business_tags.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {showProfileForm && (
          <div className="mt-4">
            <BusinessProfileForm
              initialData={{
                business_category: form.business_category,
                business_tags: form.business_tags || []
              }}
              onSubmit={handleProfileSubmit}
              onCancel={() => setShowProfileForm(false)}
              isEditing={hasProfile}
              disabled={disabled}
            />
          </div>
        )}

        {!hasProfile && !showProfileForm && (
          <div className="bg-[#FFF3CD] border border-[#FFEAA7] rounded-lg p-3">
            <p className="text-[#856404] text-[14px]">
              ⚠️ Profile not completed. This location won't appear in category filters until the business profile is set up.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="px-4 py-2 rounded-md font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--sb-green)', color: '#fff' }}
        >
          {isEditing ? 'Update' : 'Add'} Location
        </button>
        <button
          onClick={onCancel}
          className="btn-secondary text-sm"
          disabled={disabled}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}