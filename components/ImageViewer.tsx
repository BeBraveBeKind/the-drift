'use client'

import { useState, useRef, useEffect, WheelEvent, MouseEvent, TouchEvent } from 'react'
import Image from 'next/image'

interface ImageViewerProps {
  src: string
  alt: string
  onClose: () => void
}

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  // Zoom constraints
  const MIN_SCALE = 0.5
  const MAX_SCALE = 5
  const ZOOM_STEP = 0.25

  useEffect(() => {
    // Prevent body scroll when viewer is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
        case '_':
          zoomOut()
          break
        case '0':
          resetZoom()
          break
        case 'ArrowLeft':
          pan(50, 0)
          break
        case 'ArrowRight':
          pan(-50, 0)
          break
        case 'ArrowUp':
          pan(0, 50)
          break
        case 'ArrowDown':
          pan(0, -50)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scale, position])

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    const newScale = Math.min(Math.max(scale + delta, MIN_SCALE), MAX_SCALE)
    
    if (containerRef.current && imageRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Zoom towards cursor position
      const scaleChange = newScale / scale
      const newX = x - (x - position.x) * scaleChange
      const newY = y - (y - position.y) * scaleChange
      
      setScale(newScale)
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true)
      setDragStart({ 
        x: e.clientX - position.x, 
        y: e.clientY - position.y 
      })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch support for mobile
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ 
        x: touch.clientX - position.x, 
        y: touch.clientY - position.y 
      })
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0]
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      })
    }
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + ZOOM_STEP, MAX_SCALE))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - ZOOM_STEP, MIN_SCALE))
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const fitToScreen = () => {
    if (containerRef.current && imageSize.width && imageSize.height) {
      const container = containerRef.current.getBoundingClientRect()
      const scaleX = container.width / imageSize.width
      const scaleY = container.height / imageSize.height
      const newScale = Math.min(scaleX, scaleY, 1) * 0.9 // 90% of container
      setScale(newScale)
      setPosition({ x: 0, y: 0 })
    }
  }

  const pan = (deltaX: number, deltaY: number) => {
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={zoomIn}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Zoom In (+)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <button
              onClick={zoomOut}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Zoom Out (-)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Reset (0)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={fitToScreen}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Fit to Screen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <span className="ml-2 text-white text-sm bg-white/10 px-2 py-1 rounded">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Close (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 max-w-md mx-auto">
          <div className="text-white/80 text-xs space-y-1">
            <p>🖱️ Scroll wheel or +/- to zoom • Click & drag to pan</p>
            <p>⌨️ Arrow keys to pan • 0 to reset • Esc to close</p>
            <p>📱 Pinch to zoom • Swipe to pan</p>
          </div>
        </div>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <div
          ref={imageRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          <img
            src={src}
            alt={alt}
            onLoad={(e) => {
              const img = e.currentTarget
              setImageSize({ width: img.naturalWidth, height: img.naturalHeight })
            }}
            className="max-w-none"
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}