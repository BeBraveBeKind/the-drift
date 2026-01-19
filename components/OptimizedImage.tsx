'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  sizes?: string
  onLoadingComplete?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes,
  onLoadingComplete
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative" style={{ aspectRatio: `${width}/${height}` }}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#FDF6E3] animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onLoadingComplete={() => {
          setIsLoading(false)
          onLoadingComplete?.()
        }}
        placeholder="empty"
      />
    </div>
  )
}