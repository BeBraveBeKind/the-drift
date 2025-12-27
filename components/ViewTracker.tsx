'use client'

import { useEffect } from 'react'

export default function ViewTracker({ locationId }: { locationId: string }) {
  useEffect(() => {
    // Fire and forget - don't block render
    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId })
    }).catch(() => {}) // Silently fail
  }, [locationId])
  
  return null
}