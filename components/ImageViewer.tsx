'use client'

import { useState, useRef, useEffect, WheelEvent, MouseEvent, TouchEvent } from 'react'
import Image from 'next/image'
import type { ImageViewerProps } from '@/types'

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 4))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5))
  const reset = () => { setScale(1); setPosition({ x: 0, y: 0 }) }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY > 0) {
      zoomOut()
    } else {
      zoomIn()
    }
  }

  const handleImageClick = (e: React.MouseEvent) => {
    // Don't zoom if user just finished dragging
    if (hasDragged) {
      setHasDragged(false)
      return
    }
    
    if (!imageRef.current || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    
    // Calculate the point we want to zoom into
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    if (scale === 1) {
      // Zoom in to 200% centered on click point
      setScale(2)
      const offsetX = (centerX - clickX) * 0.5
      const offsetY = (centerY - clickY) * 0.5
      setPosition({ x: offsetX, y: offsetY })
    } else if (scale === 2) {
      // Zoom in more to 300%
      setScale(3)
    } else {
      // Reset to 100%
      reset()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setHasDragged(false)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setHasDragged(true)
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Don't reset hasDragged here - let the click handler deal with it
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column'
      }}
      onWheel={handleWheel}
    >
      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px',
        backgroundColor: 'rgba(0,0,0,0.8)'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={zoomIn}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Zoom In
          </button>
          <button 
            onClick={zoomOut}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Zoom Out
          </button>
          <button 
            onClick={reset}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Reset
          </button>
          <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
            {Math.round(scale * 100)}%
          </span>
        </div>
        <button 
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Close
        </button>
      </div>

      {/* Image */}
      <div 
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          ref={imageRef}
          src={src} 
          alt={alt}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            maxWidth: '90vw',
            maxHeight: '90vh',
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            cursor: scale === 1 ? 'zoom-in' : 'inherit'
          }}
          draggable={false}
          onClick={handleImageClick}
        />
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '15px',
        borderRadius: '5px',
        color: 'white'
      }}>
        <strong>Click on the image</strong> to zoom into that spot • Drag to pan when zoomed • Click again to zoom more or reset
      </div>
    </div>
  )
}