'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera } from 'lucide-react'

interface PhotoPromptProps {
  townSlug: string
  businessSlug: string
  lastUpdated?: string
}

const TIPS = [
  'Step back — get the whole board in frame',
  'Shoot straight on — avoid angles',
  'Good light — make sure flyers are readable',
]

const TIP_DURATION = 3200
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

export default function PhotoPrompt({
  townSlug,
  businessSlug,
  lastUpdated,
}: PhotoPromptProps) {
  const [tipIndex, setTipIndex] = useState(0)
  const [dismissed, setDismissed] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISS_KEY)
    if (!wasDismissed) setDismissed(false)

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (prefersReducedMotion) return
    intervalRef.current = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length)
    }, TIP_DURATION)
  }, [prefersReducedMotion])

  useEffect(() => {
    startInterval()
    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      } else {
        startInterval()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [startInterval])

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  if (dismissed) return null

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
      {/* Freshness urgency — the WHY */}
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

      {/* Primary CTA — the WHAT */}
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

      {/* Rotating tip — the HOW (supplementary) */}
      <p
        className="text-sm mt-4 mb-3 text-center"
        style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}
        aria-live="polite"
      >
        <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Tip:</span>{' '}
        {TIPS[tipIndex]}
      </p>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="flex items-center justify-center w-full font-semibold cursor-pointer transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 hover:text-white/90 active:bg-white/5"
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
