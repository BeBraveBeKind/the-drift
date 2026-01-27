'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import ImageViewer from './ImageViewer'
import type { BoardImageProps } from '@/types'

export default function BoardImage({ src, alt }: BoardImageProps) {
  const [showViewer, setShowViewer] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageClick = () => {
    setShowViewer(true)
  }
  
  // Use stable values based on the src URL to avoid hydration mismatches
  const stableValues = useMemo(() => {
    // Generate deterministic values from the src string
    let hash = 0
    for (let i = 0; i < src.length; i++) {
      hash = ((hash << 5) - hash) + src.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }
    
    // Use the hash to generate consistent values
    const rotation = ((Math.abs(hash) % 20) - 10) / 10 // -1 to 1 degree
    const pushpinColors = ['#D94F4F', '#F4D03F', '#5B9BD5', '#6BBF59']
    const pushpinColor = pushpinColors[Math.abs(hash) % pushpinColors.length]
    
    return { rotation, pushpinColor }
  }, [src])
  
  return (
    <>
      {/* Info card above the frame */}
      <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Click the photo</span> to zoom in and explore details
          </p>
        </div>
      </div>
      
      {/* Cork Board Style Frame */}
      <div className="relative bg-[#C4A574] p-6 sm:p-8 rounded-xl shadow-xl">
        {/* Cork texture overlay */}
        <div 
          className="absolute inset-0 opacity-30 rounded-lg"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Polaroid-style photo container */}
        <div 
          className="relative bg-[#FFFEF9] p-2.5 sm:p-3 shadow-xl border border-[#E5E5E5] group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
          onClick={handleImageClick}
        >
          {/* Pushpin at top */}
          <div 
            className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full shadow-sm transform -translate-x-1/2 z-20"
            style={{ backgroundColor: stableValues.pushpinColor }}
          >
            <div 
              className="w-1.5 h-1.5 rounded-full absolute top-0.5 left-0.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
            />
          </div>
          
          {/* Photo area with border */}
          <div className="bg-white border-4 border-[#F5F5F0] relative overflow-hidden">
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
            
            <Image 
              src={src}
              alt={alt}
              width={1200}
              height={900}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
              className={`w-full h-auto transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              priority={true}
              onLoadingComplete={() => setImageLoaded(true)}
            />
            
            {/* Hover overlay with zoom hint */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">Click to examine photo</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Photo caption area (like polaroid bottom) */}
          <div className="pt-2 pb-0.5 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider opacity-70">Click to View</p>
          </div>
        </div>
        
        {/* Additional decorative pushpins */}
        <div 
          className="absolute top-5 right-6 w-2.5 h-2.5 rounded-full shadow-sm"
          style={{ backgroundColor: '#D94F4F' }}
        >
          <div 
            className="w-1 h-1 rounded-full absolute top-0.5 left-0.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
          />
        </div>
        
        <div 
          className="absolute bottom-6 left-5 w-2.5 h-2.5 rounded-full shadow-sm"
          style={{ backgroundColor: '#F4D03F' }}
        >
          <div 
            className="w-1 h-1 rounded-full absolute top-0.5 left-0.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
          />
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