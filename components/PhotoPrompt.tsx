'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [dismissed, setDismissed] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TIPS.length)
    }, SLIDE_DURATION)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (dismissed) return null

  const freshnessMsg = getFreshnessMessage(lastUpdated)
  const tip = TIPS[current]

  return (
    <div
      className="mb-6 overflow-hidden"
      style={{
        background: 'var(--sb-charcoal)',
        borderRadius: 'var(--sb-radius)',
      }}
    >
      {/* Photo — clean, no text overlay */}
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current}
          src={tip.image}
          alt={tip.label}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Progress pips only */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-3">
          {TIPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.25)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: '#F59E0B',
                  width: i < current ? '100%' : i === current ? '100%' : '0%',
                  transition:
                    i === current
                      ? `width ${SLIDE_DURATION}ms linear`
                      : 'none',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* All text on solid dark background */}
      <div className="px-5 pt-5 pb-6">
        {/* Tip label */}
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

        {/* Post to Switchboard */}
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
          className="flex items-center justify-center gap-3 w-full font-bold no-underline"
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
          onClick={() => setDismissed(true)}
          className="flex items-center justify-center w-full font-semibold no-underline cursor-pointer mt-3"
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
