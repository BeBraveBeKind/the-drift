'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'
import { Camera } from 'lucide-react'

interface PhotoPromptProps {
  townSlug: string
  businessSlug: string
  lastUpdated?: string
}

const DISMISS_KEY = 'sb-photo-prompt-dismissed'

function getFreshnessMessage(lastUpdated?: string): string {
  if (!lastUpdated) return 'This board has never been photographed.'
  const days = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (days === 0) return 'Updated today — keep it fresh!'
  if (days === 1) return 'Updated yesterday.'
  if (days < 7) return `Updated ${days} days ago.`
  if (days < 30) return `Updated ${Math.floor(days / 7)} weeks ago — time for a refresh.`
  return `Last updated ${days} days ago — this board needs you.`
}

/**
 * QR-visitor prompt to update a bulletin board photo.
 * Simplified: freshness message + CTA + dismiss.
 * Tips are now shown on the post page where they're actionable.
 */
export default function PhotoPrompt({
  townSlug,
  businessSlug,
  lastUpdated,
}: PhotoPromptProps) {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener('storage', cb)
    return () => window.removeEventListener('storage', cb)
  }, [])
  const getSnapshot = useCallback(() => localStorage.getItem(DISMISS_KEY), [])
  const getServerSnapshot = useCallback(() => '1', []) // SSR: assume dismissed
  const dismissedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [localDismissed, setLocalDismissed] = useState(false)

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setLocalDismissed(true)
  }

  if (dismissedValue || localDismissed) return null

  const freshnessMsg = getFreshnessMessage(lastUpdated)

  return (
    <div
      className="mb-6"
      role="region"
      aria-label="Photo upload prompt"
      style={{
        background: 'var(--sb-charcoal)',
        borderRadius: 'var(--sb-radius)',
        padding: '20px',
      }}
    >
      {/* Freshness urgency */}
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-1"
        style={{ color: '#F59E0B' }}
      >
        Post to Switchboard
      </p>
      <p
        className="text-sm mb-5"
        style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}
      >
        {freshnessMsg}
      </p>

      {/* Primary CTA */}
      <a
        href={`/post/${townSlug}/${businessSlug}`}
        className="flex items-center justify-center gap-3 w-full font-bold no-underline transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 active:brightness-90"
        style={{
          background: '#F59E0B',
          color: 'var(--sb-charcoal)',
          borderRadius: '8px',
          height: '56px',
          fontSize: '18px',
        }}
      >
        <Camera size={22} strokeWidth={2.5} />
        Take a Photo
      </a>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="flex items-center justify-center w-full font-semibold cursor-pointer transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 hover:text-white/90 active:bg-white/5 mt-3"
        style={{
          background: 'transparent',
          color: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          height: '44px',
          fontSize: '15px',
        }}
      >
        Not right now
      </button>
    </div>
  )
}
