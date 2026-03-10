'use client'

import { useState, useEffect, useRef } from 'react'
import { hasSeenInterruptor, markInterruptorSeen } from '@/lib/probes'
import { X } from 'lucide-react'
import Image from 'next/image'

interface InterruptorProps {
  townName: string
}

/**
 * Interruptor — visual "How it works" hint for first-time visitors.
 *
 * Stacked layout: looping video on top, text below, dismiss in corner.
 * Appears once per visitor (localStorage). col-span-full in the town grid.
 * Respects prefers-reduced-motion — shows static poster instead of video.
 */
export default function Interruptor({ townName }: InterruptorProps) {
  const [visible, setVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!hasSeenInterruptor()) {
      setVisible(true)
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
  }, [])

  function handleDismiss() {
    markInterruptorSeen()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="col-span-full overflow-hidden"
      style={{
        background: 'var(--sb-warm-white)',
        borderRadius: 'var(--sb-radius)',
        border: '1px solid var(--sb-warm-gray)',
      }}
    >
      {/* Video or static poster */}
      <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
        {reducedMotion ? (
          <Image
            src="/instructional/interruptor-poster.jpg"
            alt="Phone showing a Switchboard business page after scanning a QR code on a bulletin board"
            fill
            priority
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 640px) 240px, 480px"
          />
        ) : (
          <video
            ref={videoRef}
            src="/instructional/interruptor.mp4"
            poster="/instructional/interruptor-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Dismiss button overlaid on video */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 cursor-pointer flex items-center justify-center"
          style={{
            background: 'rgba(0,0,0,0.4)',
            color: '#fff',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            border: 'none',
          }}
          aria-label="Dismiss hint"
        >
          <X size={14} />
        </button>
      </div>

      {/* Text */}
      <div style={{ padding: '10px 12px' }}>
        <p
          className="text-sm leading-snug"
          style={{ color: 'var(--sb-stone)' }}
        >
          <span className="font-semibold" style={{ color: 'var(--sb-charcoal)' }}>
            Every board in {townName}.
          </span>
          {' '}New stuff goes up daily&thinsp;&mdash;&thinsp;you&rsquo;d miss most of it.
        </p>
      </div>
    </div>
  )
}
