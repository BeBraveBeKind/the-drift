'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface OptimizedBoardImageProps {
  src: string
  alt: string
  priority?: boolean
  index: number
}

// Generate blur placeholder 
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f3f4f6" offset="20%" />
      <stop stop-color="#e5e7eb" offset="50%" />
      <stop stop-color="#f3f4f6" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f3f4f6" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

const dataUrl = `data:image/svg+xml;base64,${toBase64(shimmer(280, 210))}`

export default function OptimizedBoardImage({
  src,
  alt,
  priority = false,
  index
}: OptimizedBoardImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  // Prioritize first 6 images for faster initial paint
  const shouldPrioritize = priority || index < 6

  if (hasError) {
    return (
      <div 
        className="board-card-polaroid__image board-card-polaroid__image--placeholder"
        style={{
          width: 280,
          height: 210,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6'
        }}
      >
        <span style={{ fontSize: '1rem', opacity: 0.5, color: 'var(--text-muted)' }}>
          Image unavailable
        </span>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: 280, height: 210 }}>
      <Image 
        src={src}
        alt={alt}
        width={280}
        height={210}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
        className={`board-card-polaroid__image ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={shouldPrioritize}
        loading={shouldPrioritize ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL={dataUrl}
        quality={85}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}