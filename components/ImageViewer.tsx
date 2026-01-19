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
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 5))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.75))
  const reset = () => { setScale(1); setPosition({ x: 0, y: 0 }) }
  const fitToScreen = () => { setScale(1); setPosition({ x: 0, y: 0 }) }

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
  
  // Handle keyboard shortcuts
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
          fitToScreen()
          break
        case 'ArrowLeft':
          setPosition(prev => ({ ...prev, x: prev.x + 50 }))
          break
        case 'ArrowRight':
          setPosition(prev => ({ ...prev, x: prev.x - 50 }))
          break
        case 'ArrowUp':
          setPosition(prev => ({ ...prev, y: prev.y + 50 }))
          break
        case 'ArrowDown':
          setPosition(prev => ({ ...prev, y: prev.y - 50 }))
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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
        padding: '16px 20px',
        backgroundColor: 'rgba(0,0,0,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={zoomIn}
            title="Zoom In (Scroll Up)"
            style={{
              padding: '8px 12px',
              backgroundColor: scale >= 5 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: scale >= 5 ? 'rgba(255,255,255,0.4)' : 'white',
              cursor: scale >= 5 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            disabled={scale >= 5}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
            </svg>
            Zoom In
          </button>
          <button 
            onClick={zoomOut}
            title="Zoom Out (Scroll Down)"
            style={{
              padding: '8px 12px',
              backgroundColor: scale <= 0.75 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: scale <= 0.75 ? 'rgba(255,255,255,0.4)' : 'white',
              cursor: scale <= 0.75 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            disabled={scale <= 0.75}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35M8 11h6"/>
            </svg>
            Zoom Out
          </button>
          <button 
            onClick={fitToScreen}
            title="Fit to Screen"
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            Fit
          </button>
          <div style={{ 
            padding: '8px 12px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: 'white', 
            fontSize: '14px', 
            fontWeight: 'bold',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {Math.round(scale * 100)}%
          </div>
        </div>
        <button 
          onClick={onClose}
          title="Close (Esc)"
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
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
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          position: 'relative',
          padding: '20px'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Loading indicator */}
        {!imageLoaded && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.2)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Loading high-resolution image...
          </div>
        )}
        
        <img 
          ref={imageRef}
          src={src} 
          alt={alt}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 160px)', // Account for controls and instructions
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: scale === 1 ? 'zoom-in' : 'inherit',
            opacity: imageLoaded ? 1 : 0
          }}
          draggable={false}
          onClick={handleImageClick}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        padding: '12px 20px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        fontSize: '13px',
        maxWidth: '600px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <span><strong>🖱️ Click</strong> to zoom</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span><strong>Drag</strong> to pan</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span><strong>Scroll</strong> to zoom</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span><strong>Esc</strong> to close</span>
        </div>
      </div>
      
      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}