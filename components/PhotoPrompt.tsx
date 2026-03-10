'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera } from 'lucide-react'
import Image from 'next/image'

interface PhotoPromptProps {
  townSlug: string
  businessSlug: string
  lastUpdated?: string
}

const TIPS = [
  {
    image: '/instructional/IMG_2396.jpg',
    label: 'Step back',
    desc: 'Get the whole board in frame.',
  },
  {
    image: '/instructional/IMG_2412.jpg',
    label: 'Straight on',
    desc: 'Shoot flat — avoid angles.',
  },
  {
    image: '/instructional/IMG_2416.jpeg',
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

  return (
    <div
      className="mb-6 overflow-hidden"
      style={{
        background: 'var(--sb-charcoal)',
        borderRadius: 'var(--sb-radius)',
      }}
    >
      {/* Looping tips slideshow */}
      <div
        className="relative w-full"
        style={{ aspectRatio: '4/3' }}
      >
        {TIPS.map((tip, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={tip.image}
              alt={tip.label}
              fill
              className="object-cover"
              sizes="640px"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(30,41,59,0.85) 0%, rgba(30,41,59,0.2) 50%, rgba(30,41,59,0) 100%)',
              }}
            />
            {/* Tip text */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: '#F59E0B', letterSpacing: '0.05em' }}
              >
                TIP {i + 1} OF {TIPS.length}
              </p>
              <p className="text-xl font-bold text-white">
                {tip.label}
              </p>
              <p
                className="text-sm"
                style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}
              >
                {tip.desc}
              </p>
            </div>
          </div>
        ))}

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
      <div className="p-5">
        <p className="text-lg font-bold text-white mb-1">
          Keep this board fresh
        </p>
        <p
          className="text-sm mb-4"
          style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}
        >
          {freshnessMsg}
        </p>

        <a
          href={`/post/${townSlug}/${businessSlug}`}
          className="flex items-center justify-center gap-2 w-full py-3 font-semibold text-base no-underline"
          style={{
            background: '#F59E0B',
            color: 'var(--sb-charcoal)',
            borderRadius: '6px',
            minHeight: '48px',
          }}
        >
          <Camera size={18} />
          Take a photo
        </a>

        <button
          onClick={() => setDismissed(true)}
          className="w-full mt-3 text-center text-sm cursor-pointer bg-transparent border-none"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Not right now
        </button>
      </div>
    </div>
  )
}
