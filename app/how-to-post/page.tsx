'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Random rotation for elements
function getRandomRotation() {
  return Math.random() * 6 - 3 // -3 to +3 degrees
}

// Pushpin colors from style guide
const pushpinColors = [
  '#D94F4F', // Pushpin Red
  '#F4D03F', // Pushpin Yellow  
  '#5B9BD5', // Pushpin Blue
  '#6BBF59'  // Pushpin Green
]

function getRandomPushpinColor() {
  return pushpinColors[Math.floor(Math.random() * pushpinColors.length)]
}

export default function HowToPostPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-[#C4A574]" />
  }

  return (
    <main className="min-h-screen bg-[#C4A574] relative">
      {/* Cork Board Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 text-center pt-8 pb-4">
        <div className="max-w-md mx-auto">
          <div className="relative inline-block">
            <div 
              className="bg-[#FFFEF9] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              }}
            >
              <h1 className="text-[28px] font-bold text-[#2C2C2C] leading-[1.2] mb-2">
                📷 How to Post
              </h1>
              <p className="text-[14px] font-medium text-[#6B6B6B] leading-[1.4]">
                Update community boards with fresh photos
              </p>
              
              {/* Pushpin at top */}
              <div 
                className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2"
                style={{ backgroundColor: getRandomPushpinColor() }}
              >
                <div 
                  className="w-3 h-3 rounded-full absolute top-1 left-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Back Link */}
      <div className="relative z-10 text-center mb-6">
        <Link href="/" className="inline-block group">
          <div 
            className="bg-[#5B9BD5] p-2 px-4 shadow-lg border-[1px] border-[#E5E5E5] relative mx-auto"
            style={{ 
              transform: `rotate(${getRandomRotation()}deg)`,
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              borderRadius: '2px'
            }}
          >
            <div className="text-[12px] font-semibold text-white group-hover:text-gray-100 transition-colors">
              ← Back to Boards
            </div>
            
            {/* Pushpin */}
            <div 
              className="absolute -top-2 left-1/2 w-4 h-4 rounded-full shadow-sm transform -translate-x-1/2"
              style={{ backgroundColor: '#D94F4F' }}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full absolute top-0.5 left-0.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
            </div>
          </div>
        </Link>
      </div>

      {/* Content */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          
          {/* Step 1: QR Code Requirement */}
          <div className="relative inline-block">
            <div 
              className="bg-[#FFFEF9] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative max-w-2xl"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
              }}
            >
              <h2 className="text-[20px] font-bold text-[#2C2C2C] mb-4">
                1️⃣ Use the QR Code at Each Location
              </h2>
              <div className="text-[14px] text-[#2C2C2C] leading-[1.5] space-y-3">
                <p>
                  <strong>Each bulletin board has its own unique QR code.</strong> You must physically visit the location and scan the QR code posted there to update that specific board.
                </p>
                <p>
                  This ensures photos are authentic, recent, and taken at the actual location. No remote posting allowed!
                </p>
              </div>
              
              {/* Pushpin */}
              <div 
                className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2"
                style={{ backgroundColor: '#D94F4F' }}
              >
                <div 
                  className="w-3 h-3 rounded-full absolute top-1 left-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Photo Guidelines */}
          <div className="relative inline-block ml-8">
            <div 
              className="bg-[#F4D03F] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative max-w-2xl"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
              }}
            >
              <h2 className="text-[20px] font-bold text-[#2C2C2C] mb-4">
                📸 Photo Guidelines
              </h2>
              <div className="text-[14px] text-[#2C2C2C] leading-[1.5] space-y-3">
                <p>
                  <strong>Capture the entire bulletin board</strong> in your photo. We want to see all the flyers, announcements, and community posts currently displayed.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Take the photo straight-on, not at an angle</li>
                  <li>Ensure good lighting - avoid glare and shadows</li>
                  <li>Make sure the image is sharp and in focus</li>
                  <li>Include the full board, edge to edge</li>
                </ul>
              </div>
              
              {/* Pushpin */}
              <div 
                className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2"
                style={{ backgroundColor: '#6BBF59' }}
              >
                <div 
                  className="w-3 h-3 rounded-full absolute top-1 left-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </div>
            </div>
          </div>

          {/* Step 3: Quality Standards */}
          <div className="relative inline-block">
            <div 
              className="bg-[#FFFEF9] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative max-w-2xl"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
              }}
            >
              <h2 className="text-[20px] font-bold text-[#2C2C2C] mb-4">
                ✨ Quality Standards
              </h2>
              <div className="text-[14px] text-[#2C2C2C] leading-[1.5] space-y-3">
                <p>
                  <strong>Consider editing your photo before uploading.</strong> Photos with issues will be removed by admins and reverted to the most recent good photo.
                </p>
                <div className="bg-[#FDF6E3] p-3 border border-[#E5E5E5] rounded">
                  <p className="font-medium text-[#D94F4F] mb-2">❌ Photos will be removed if they have:</p>
                  <ul className="list-disc pl-5 space-y-1 text-[13px]">
                    <li>Heavy glare or reflections</li>
                    <li>Blur or out-of-focus areas</li>
                    <li>People in the photo (privacy)</li>
                    <li>Poor framing or partial board coverage</li>
                    <li>Inappropriate content</li>
                  </ul>
                </div>
              </div>
              
              {/* Pushpin */}
              <div 
                className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2"
                style={{ backgroundColor: '#F4D03F' }}
              >
                <div 
                  className="w-3 h-3 rounded-full absolute top-1 left-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </div>
            </div>
          </div>

          {/* Step 4: Additional Guidelines */}
          <div className="relative inline-block ml-12">
            <div 
              className="bg-[#5B9BD5] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative max-w-2xl text-white"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
              }}
            >
              <h2 className="text-[20px] font-bold mb-4">
                📋 Additional Guidelines
              </h2>
              <div className="text-[14px] leading-[1.5] space-y-3">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Respect privacy:</strong> Avoid including people in your photos</li>
                  <li><strong>Be considerate:</strong> Don't obstruct others while taking photos</li>
                  <li><strong>Regular updates:</strong> Feel free to update boards when you notice changes</li>
                  <li><strong>Community effort:</strong> Help keep our local boards current and visible</li>
                  <li><strong>Report issues:</strong> Contact us if you notice damaged or inappropriate content</li>
                </ul>
                
                <div className="mt-4 pt-3 border-t border-white border-opacity-30">
                  <p className="font-medium">
                    🎯 <strong>Goal:</strong> Create a living archive of our community's activity and keep everyone connected to local happenings!
                  </p>
                </div>
              </div>
              
              {/* Pushpin */}
              <div 
                className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2"
                style={{ backgroundColor: '#D94F4F' }}
              >
                <div 
                  className="w-3 h-3 rounded-full absolute top-1 left-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </div>
            </div>
          </div>

        </div>
      </section>
      
      <footer className="mt-16 py-8 border-t border-stone-200 text-center text-sm text-stone-400">
        <p>Questions? Contact us through the About page or find us around town!</p>
        <p className="mt-1">A production of Ofigona, LLC</p>
      </footer>
    </main>
  )
}