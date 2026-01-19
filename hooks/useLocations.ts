'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { LocationWithPhoto, UseLocationsResult } from '@/types'

export function useLocations(townSlug: string): UseLocationsResult {
  const [locations, setLocations] = useState<LocationWithPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLocations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get town by slug
      const { data: townData, error: townError } = await supabase
        .from('towns')
        .select('id, name, slug')
        .eq('slug', townSlug)
        .eq('is_active', true)
        .single()

      if (townError || !townData) {
        throw new Error('Town not found')
      }

      // Get all locations with their current photos in a single query
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select(`
          id,
          name,
          slug,
          address,
          town,
          town_id,
          view_count,
          updated_at,
          business_category,
          business_tags,
          profile_completed,
          latitude,
          longitude,
          photos!inner(
            id,
            storage_path,
            created_at
          )
        `)
        .eq('is_active', true)
        .eq('town_id', townData.id)
        .eq('photos.is_current', true)
        .eq('photos.is_flagged', false)
        .order('updated_at', { ascending: false })

      if (locationsError) {
        throw new Error(locationsError.message)
      }

      // Also get locations without photos
      const { data: locationsWithoutPhotos, error: noPhotosError } = await supabase
        .from('locations')
        .select('id, name, slug, address, town, town_id, view_count, updated_at, business_category, business_tags, profile_completed, latitude, longitude')
        .eq('is_active', true)
        .eq('town_id', townData.id)
        .not('id', 'in', `(${(locationsData || []).map(l => l.id).join(',') || 'null'})`)
        .order('updated_at', { ascending: false })

      if (noPhotosError) {
        throw new Error(noPhotosError.message)
      }

      // Combine and format results
      const withPhotos = (locationsData || []).map(location => ({
        ...location,
        photo: location.photos[0] || null
      }))

      const withoutPhotos = (locationsWithoutPhotos || []).map(location => ({
        ...location,
        photo: null
      }))

      const allLocations = [...withPhotos, ...withoutPhotos]

      // Sort by most recent photo/update
      const sorted = allLocations.sort((a, b) => {
        const dateA = a.photo ? new Date(a.photo.created_at).getTime() : new Date(a.updated_at).getTime()
        const dateB = b.photo ? new Date(b.photo.created_at).getTime() : new Date(b.updated_at).getTime()
        return dateB - dateA
      })

      setLocations(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (townSlug) {
      loadLocations()
    }
  }, [townSlug])

  return {
    locations,
    loading,
    error,
    reload: loadLocations
  }
}