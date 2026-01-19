'use client'

import type { LocationFormData, Town } from '@/types'

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

  const isSubmitDisabled = !form.name.trim() || !form.slug.trim() || !form.town_id || disabled

  return (
    <div className="bg-[#FFFEF9] p-6 rounded-lg border border-[#E5E5E5] shadow-sm">
      <h2 className="text-[18px] font-semibold text-[#2C2C2C] mb-4">
        {isEditing ? 'Edit Location' : 'Add New Location'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[14px] font-medium text-[#2C2C2C] mb-1">
            Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
            placeholder="Business name"
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="block text-[14px] font-medium text-[#2C2C2C] mb-1">
            Slug *
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => onFormChange({ ...form, slug: e.target.value })}
            className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
            placeholder="url-friendly-name"
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="block text-[14px] font-medium text-[#2C2C2C] mb-1">
            Town *
          </label>
          <select
            value={form.town_id}
            onChange={(e) => onFormChange({ ...form, town_id: e.target.value })}
            className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
            disabled={disabled}
          >
            {towns.map(town => (
              <option key={town.id} value={town.id}>{town.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-[14px] font-medium text-[#2C2C2C] mb-1">
            Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => onFormChange({ ...form, address: e.target.value })}
            className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
            placeholder="123 Main St"
            disabled={disabled}
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-[14px] font-medium text-[#2C2C2C] mb-1">
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => onFormChange({ ...form, description: e.target.value })}
            className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
            placeholder="Optional description"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="bg-[#6BBF59] text-white px-4 py-2 rounded-md font-semibold text-[14px] hover:bg-[#5da850] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? 'Update' : 'Add'} Location
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded-md font-semibold text-[14px] hover:bg-gray-600 transition-colors"
          disabled={disabled}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}