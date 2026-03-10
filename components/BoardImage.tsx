'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImageViewer from './ImageViewer'
import { ZoomIn } from 'lucide-react'
import type { BoardImageProps } from '@/types'

/**
 * Business page board photo.
 * Design system: full-width, 1px warm gray border, 8px radius.
 * No polaroid frame, no cork, no pushpins, no shadows.
 * Click to open full-screen ImageViewer for zoom/pan.
 */
export default function BoardImage({ src, alt }: BoardImageProps) {
  const [showViewer, setShowViewer] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <>
      <div
        className="relative cursor-pointer group"
        onClick={() => setShowViewer(true)}
        style={{
          border: '1px solid var(--sb-warm-gray)',
          borderRadius: 'var(--sb-radius)',
          overflow: 'hidden',
        }}
      >
        {!imageLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: 'var(--sb-warm-white)' }}
          />
        )}

        <Image
          src={src}
          alt={alt}
          width={1200}
          height={900}
          sizes="(max-width: 640px) 100vw, 640px"
          className="w-full h-auto"
          priority
          onLoad={() => setImageLoaded(true)}
        />

        {/* Hover overlay — zoom hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-full flex items-center gap-2">
            <ZoomIn size={16} color="var(--sb-charcoal)" />
            <span className="text-sm font-medium" style={{ color: 'var(--sb-charcoal)' }}>
              Tap to zoom
            </span>
          </div>
        </div>
      </div>

      {showViewer && (
        <ImageViewer
          src={src}
          alt={alt}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  )
}
