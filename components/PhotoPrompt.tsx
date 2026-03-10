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
      {/* Single active slide — no stacking/overlap */}
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current}
          src={tip.image}
          alt={tip.label}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay — heavy enough for legible text */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(30,41,59,0.95) 0%, rgba(30,41,59,0.85) 40%, rgba(30,41,59,0.2) 100%)',
          }}
        />
        {/* Tip text */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: '#F59E0B', letterSpacing: '0.1em' }}
          >
            TIP {current + 1}/{TIPS.length}
          </p>
          <p
            className="text-2xl font-bold leading-tight"
            style={{ color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            {tip.label}
          </p>
          <p
            className="text-base leading-snug"
            style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
          >
            {tip.desc}
          </p>
        </div>

        {/* Progress pips */}
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

      {/* CTA section */}
      <div className="p-4">
        <p
          className="text-xs font-semibold mb-1 tracking-widest uppercase"
          style={{ color: '#F59E0B' }}
        >
          Post to Switchboard
        </p>
        <p
          className="text-sm mb-4"
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
