'use client'

import { useState, useEffect } from 'react'
import { hasSeenInterruptor, markInterruptorSeen } from '@/lib/probes'
import { X } from 'lucide-react'

/**
 * Interruptor — "How It Works" explainer card.
 *
 * Appears once per visitor (controlled by localStorage).
 * Inserted after row 2 of the town grid.
 * Full-width card with Amber Gold border.
 */
export default function Interruptor() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!hasSeenInterruptor()) {
      setVisible(true)
    }
  }, [])

  function handleDismiss() {
    markInterruptorSeen()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="col-span-full relative"
      style={{
        border: '2px solid var(--sb-amber)',
        borderRadius: 'var(--sb-radius)',
        background: 'var(--sb-warm-white)',
        padding: '24px 20px',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 cursor-pointer"
        style={{ color: 'var(--sb-stone)' }}
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>

      <div className="text-center">
        {/* Placeholder for future GIF — static text for now */}
        <p
          className="text-base font-semibold mb-1"
          style={{ color: 'var(--sb-charcoal)' }}
        >
          Scan any board. See what&rsquo;s new.
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
        >
          No app. No account.
        </p>
      </div>
    </div>
  )
}
