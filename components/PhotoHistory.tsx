'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import ImageViewer from './ImageViewer'
import { getPhotoUrl } from '@/lib/utils'

/**
 * PhotoHistory — Switchboard Design System
 *
 * Horizontal scrollable row of 80x80 thumbnails.
 * P4 Context section per business page copy doc.
 * Fetches from /api/photos/history.
 */

interface HistoryPhoto {
  id: string
  storage_path: string
  created_at: string
  is_current?: boolean
}

function formatThumbDate(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullDate(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function PhotoHistory({ locationId }: { locationId: string }) {
  const [photos, setPhotos] = useState<HistoryPhoto[]>([])
  const [loaded, setLoaded] = useState(false)
  const [viewerSrc, setViewerSrc] = useState<string | null>(null)
  const [viewerAlt, setViewerAlt] = useState('')

  useEffect(() => {
    fetch(`/api/photos/history?location_id=${locationId}`)
      .then((r) => r.json())
      .then((data) => {
        setPhotos(data.photos || [])
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [locationId])

  if (!loaded) return null

  // Only show history section if there are 2+ photos (1 = current, no "history")
  if (photos.length <= 1) {
    return (
      <div className="mb-8">
        <h2
          className="text-xl font-semibold mb-3"
          style={{ color: 'var(--sb-charcoal)' }}
        >
          Photo history
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
        >
          No photo history yet
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: 'var(--sb-charcoal)' }}
        >
          Photo history
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => {
                setViewerSrc(getPhotoUrl(photo.storage_path))
                setViewerAlt(`Photo from ${formatFullDate(photo.created_at)}`)
              }}
              className="flex-shrink-0 cursor-pointer"
            >
              <div
                className="w-20 h-20 relative overflow-hidden"
                style={{
                  border: '1px solid var(--sb-warm-gray)',
                  borderRadius: 'var(--sb-radius)',
                }}
              >
                <Image
                  src={getPhotoUrl(photo.storage_path)}
                  alt={`Photo from ${formatThumbDate(photo.created_at)}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <p
                className="text-xs text-center mt-1"
                style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
              >
                {formatThumbDate(photo.created_at)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {viewerSrc && (
        <ImageViewer
          src={viewerSrc}
          alt={viewerAlt}
          onClose={() => setViewerSrc(null)}
        />
      )}
    </>
  )
}
