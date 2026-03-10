'use client'

import { useState, useEffect } from 'react'
import { hasSeenInterruptor, markInterruptorSeen } from '@/lib/probes'
import { X } from 'lucide-react'

interface InterruptorProps {
  townName: string
}

/**
 * Interruptor — inline hint for first-time visitors.
 *
 * Appears once per visitor (controlled by localStorage).
 * Slim amber bar inserted after the first row of the town grid.
 * Tells the user what they're looking at and what to do.
 */
export default function Interruptor({ townName }: InterruptorProps) {
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
      className="col-span-full flex items-center gap-3"
      style={{
        background: '#FEF3C7',
        borderRadius: 'var(--sb-radius)',
        padding: '12px 16px',
      }}
    >
      <p
        className="text-sm font-medium flex-1"
        style={{ color: 'var(--sb-charcoal)' }}
      >
        Each card is a bulletin board in {townName}. Tap one to see what&rsquo;s posted.
      </p>
      <button
        onClick={handleDismiss}
        className="cursor-pointer flex-shrink-0"
        style={{ color: 'var(--sb-stone)' }}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  )
}
