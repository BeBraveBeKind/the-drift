'use client'

import { useState } from 'react'

export default function FlagButton({ photoId }: { photoId: string }) {
  const [flagged, setFlagged] = useState(false)
  const [loading, setLoading] = useState(false)
  
  async function handleFlag() {
    if (flagged || loading) return
    
    setLoading(true)
    
    try {
      await fetch('/api/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      })
      setFlagged(true)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button
      onClick={handleFlag}
      disabled={flagged || loading}
      className="text-stone-300 hover:text-orange-500 text-sm disabled:cursor-default"
    >
      {flagged ? 'Flagged' : 'Flag'}
    </button>
  )
}