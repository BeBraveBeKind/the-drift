'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImageViewer from './ImageViewer'

interface BoardImageProps {
  src: string
  alt: string
}

export default function BoardImage({ src, alt }: BoardImageProps) {
  const [showViewer, setShowViewer] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="relative group">
          <Image 
            src={src}
            alt={alt}
            width={1200}
            height={900}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
            className="w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
            priority={true}
            onClick={() => setShowViewer(true)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all pointer-events-none flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Click to view full size
              </span>
            </div>
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