'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Town } from '@/lib/types'

interface TownFormProps {
  town?: Town
  onSuccess: () => void
  onCancel: () => void
}

export default function TownForm({ town, onSuccess, onCancel }: TownFormProps) {
  const supabase = createClient()
  const [name, setName] = useState(town?.name || '')
  const [slug, setSlug] = useState(town?.slug || '')
  const [description, setDescription] = useState(town?.description || '')
  const [isActive, setIsActive] = useState(town?.is_active ?? true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!town) {
      setSlug(generateSlug(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (town) {
        const { error: updateError } = await supabase
          .from('towns')
          .update({ 
            name, 
            slug, 
            description: description || null, 
            is_active: isActive 
          })
          .eq('id', town.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('towns')
          .insert([{ 
            name, 
            slug, 
            description: description || null, 
            is_active: isActive 
          }])

        if (insertError) throw insertError
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded border">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Town Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-500"
          placeholder="e.g., Viroqua"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Slug (URL-friendly) *
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          pattern="[a-z0-9-]+"
          className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-500"
          placeholder="e.g., viroqua"
        />
        <p className="text-xs text-stone-500 mt-1">
          This will be used in URLs: switchboard.town/{slug || 'your-town'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-500"
          placeholder="Optional description of this town"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-stone-600 border-stone-300 rounded focus:ring-stone-500"
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-stone-700">
          Active (visible on the site)
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading || !name.trim() || !slug.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : town ? 'Update Town' : 'Create Town'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}