'use client'

import { useState } from 'react'
import { Flag, CheckCircle } from 'lucide-react'

/**
 * FlagButton — Switchboard Design System
 *
 * De-emphasized text link with flag icon.
 * Calls /api/flag to mark a photo for review.
 * Full flag modal with reasons is a Phase 2 enhancement.
 */
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
        body: JSON.stringify({ photoId }),
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
      className="inline-flex items-center gap-1.5 text-sm hover:underline cursor-pointer disabled:cursor-default"
      style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
    >
      {flagged ? (
        <>
          <CheckCircle size={14} color="#16A34A" />
          <span style={{ color: '#16A34A' }}>Flagged</span>
        </>
      ) : (
        <>
          <Flag size={14} />
          Flag this listing
        </>
      )}
    </button>
  )
}
