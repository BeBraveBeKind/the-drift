'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera } from 'lucide-react'

interface PhotoPromptProps {
  townSlug: string
  businessSlug: string
  lastUpdated?: string
}

const TIPS = [
  {
    image: '/instructional/tip-1.webp',
    label: 'Step back',
    desc: 'Get the whole board in frame.',
  },
  {
    image: '/instructional/tip-2.webp',
    label: 'Straight on',
    desc: 'Shoot flat — avoid angles.',
  },
  {
    image: '/instructional/tip-3.webp',
    label: 'Good light',
    desc: 'Make sure flyers are readable.',
  },
]

const SLIDE_DURATION = 2800
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
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(true) // hidden until hydration check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check dismiss state + motion preference on mount
  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISS_KEY)
    if (!wasDismissed) setDismissed(false)

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Auto-advance slides (respects reduced motion + tab visibility)
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (prefersReducedMotion) return
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TIPS.length)
    }, SLIDE_DURATION)
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

  // Preload next image
  useEffect(() => {
    const nextIndex = (current + 1) % TIPS.length
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'image'
    link.href = TIPS[nextIndex].image
    document.head.appendChild(link)
    return () => { link.remove() }
  }, [current])

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  if (dismissed) return null

  const freshnessMsg = getFreshnessMessage(lastUpdated)
  const tip = TIPS[current]

  return (
    <div
      className="mb-6 overflow-hidden"
      role="region"
      aria-label="Photo tips and upload prompt"
      style={{
        background: 'var(--sb-charcoal)',
        borderRadius: 'var(--sb-radius)',
      }}
    >
      {/* Photo slideshow with crossfade */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '16/9' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {TIPS.map((t, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={t.image}
            alt={t.label}
            width={800}
            height={450}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: i === current ? 1 : 0,
              transition: prefersReducedMotion ? 'none' : 'opacity 400ms ease',
            }}
          />
        ))}

        {/* Progress pips */}
        <div
          className="absolute top-0 left-0 right-0 flex gap-1 p-3"
          role="tablist"
          aria-label="Photo tips progress"
        >
          {TIPS.map((t, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Tip ${i + 1}: ${t.label}`}
              className="flex-1 h-[3px] rounded-full overflow-hidden cursor-pointer border-none p-0"
              style={{ background: 'rgba(255,255,255,0.25)' }}
              onClick={() => {
                setCurrent(i)
                startInterval() // reset timer on manual nav
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: '#F59E0B',
                  width: i < current ? '100%' : i === current ? '100%' : '0%',
                  transition:
                    prefersReducedMotion
                      ? 'none'
                      : i === current
                        ? `width ${SLIDE_DURATION}ms linear`
                        : 'none',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* All text on solid dark background */}
      <div className="px-5 pt-5 pb-6">
        {/* Tip copy */}
        <p
          className="text-sm font-semibold mb-2"
          style={{ color: '#F59E0B', letterSpacing: '0.1em' }}
        >
          TIP {current + 1}/{TIPS.length}
        </p>
        <p className="text-2xl font-bold text-white leading-tight mb-1">
          {tip.label}
        </p>
        <p
          className="text-base leading-snug mb-5"
          style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}
        >
          {tip.desc}
        </p>

        {/* Divider */}
        <div
          className="mb-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        />

        {/* CTA section */}
        <p
          className="text-xs font-semibold mb-1 tracking-widest uppercase"
          style={{ color: '#F59E0B' }}
        >
          Post to Switchboard
        </p>
        <p
          className="text-sm mb-5"
          style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}
        >
          {freshnessMsg}
        </p>

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

        <button
          onClick={handleDismiss}
          className="flex items-center justify-center w-full font-semibold no-underline cursor-pointer mt-3 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 hover:border-white/40 hover:text-white/90 active:bg-white/5"
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '8px',
            height: '48px',
            fontSize: '16px',
          }}
        >
          Not right now
        </button>
      </div>
    </div>
  )
}
