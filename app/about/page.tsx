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

export default function AboutPage() {
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
      
      {/* Back Link */}
      <div className="relative z-10 pt-6 px-4">
        <Link href="/" className="inline-block group">
          <div 
            className="bg-[#FFFEF9] p-2 px-4 shadow-lg border-[1px] border-[#E5E5E5] relative"
            style={{ 
              transform: `rotate(${getRandomRotation()}deg)`,
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              borderRadius: '2px'
            }}
          >
            <div className="text-[12px] font-medium text-[#2C2C2C] group-hover:text-[#1a1a1a] transition-colors">
              ← Back to boards
            </div>
            
            {/* Pushpin */}
            <div 
              className="absolute -top-2 left-1/2 w-4 h-4 rounded-full shadow-sm transform -translate-x-1/2"
              style={{ backgroundColor: getRandomPushpinColor() }}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full absolute top-0.5 left-0.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        
        {/* Title */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div 
              className="bg-[#FFFEF9] p-8 shadow-lg border-[1px] border-[#E5E5E5] relative"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              }}
            >
              <h1 className="text-[36px] font-bold text-[#2C2C2C] leading-[1.2] mb-4">
                The Drift
              </h1>
              <p className="text-[18px] font-medium text-[#6B6B6B] leading-[1.4]">
                Where flyers get a second life
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

        {/* Content Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* What Is This Card */}
          <div className="relative">
            <div 
              className="bg-[#FFFEF9] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
              }}
            >
              <h2 className="text-[20px] font-semibold text-[#2C2C2C] leading-[1.3] mb-4">
                Bulletin boards are beautiful. But let's be real.
              </h2>
              <div className="text-[14px] text-[#2C2C2C] leading-[1.5] space-y-3">
                <p>
                  <strong>We forget to look at them.</strong>
                </p>
                <p>
                  There's a yoga instructor with a hand-written class schedule. A guy who fixes bikes 
                  out of his garage. A local theater group doing something weird and wonderful next weekend.
                </p>
                <p>
                  They made a flyer. They found a thumbtack. They pinned it up. And most of us walked right past.
                </p>
                <p>
                  Those boards are full of real people doing real things in your actual neighborhood — not an 
                  algorithm, not a sponsored post, not someone trying to go viral. <strong>The Drift makes sure 
                  that stuff gets seen.</strong>
                </p>
              </div>
              
              {/* Pushpin */}
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

          {/* How It Works Card */}
          <div className="relative">
            <div 
              className="bg-[#FFFEF9] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
              }}
            >
              <h2 className="text-[20px] font-semibold text-[#2C2C2C] leading-[1.3] mb-4">
                Post your flyer. Snap a photo. Done.
              </h2>
              <div className="text-[14px] text-[#2C2C2C] leading-[1.5] space-y-3">
                <p>
                  <strong>1.</strong> Find a business board you want to update
                </p>
                <p>
                  <strong>2.</strong> Scan the QR code at that location
                </p>
                <p>
                  <strong>3.</strong> Take a photo of the entire bulletin board
                </p>
                <p>
                  <strong>4.</strong> Your photo shows up!
                </p>
                <p className="text-[12px] text-[#6B6B6B] italic">
                  Your flyer now lives in two places: on the board and online. No likes. No followers. 
                  No comments section. Just: here's what's happening near you, beyond social media.
                </p>
              </div>
              
              {/* Pushpin */}
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

          {/* Why Viroqua Card */}
          <div className="relative">
            <div 
              className="bg-[#FFFEF9] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
              }}
            >
              <h2 className="text-[20px] font-semibold text-[#2C2C2C] leading-[1.3] mb-4">
                This is for the flyer people.
              </h2>
              <div className="text-[14px] text-[#2C2C2C] leading-[1.5] space-y-3">
                <p>
                  <strong>You know who you are.</strong>
                </p>
                <p>
                  You designed something in Canva at midnight. You printed 20 copies at the library. 
                  You walked around with a stapler and a dream.
                </p>
                <p>
                  And then you thought: <em>"I wish more people could see this."</em>
                </p>
                <p>
                  Your flyer deserves more than the six people who happened to glance at the board 
                  that day. We're here to give it a longer life and a wider reach — while still 
                  keeping it local, still keeping it real.
                </p>
              </div>
              
              {/* Pushpin */}
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

          {/* Community Guidelines Card */}
          <div className="relative">
            <div 
              className="bg-[#FFFEF9] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
              }}
            >
              <h2 className="text-[20px] font-semibold text-[#2C2C2C] leading-[1.3] mb-4">
                A little nostalgia. A lot of community.
              </h2>
              <div className="text-[14px] text-[#2C2C2C] leading-[1.5] space-y-3">
                <p>
                  There's something beautiful about a physical bulletin board. It's messy. It's democratic. 
                  Anyone can pin something up. No account required, no verification, no content policy — 
                  just a thumbtack and something to say.
                </p>
                <p>
                  The Drift isn't replacing that. We're extending it. The physical board is still the 
                  real thing. This is just a way to make sure more people actually see it.
                </p>
                <p>
                  <strong>The best stuff still happens offline. We just want to make sure you hear about it.</strong>
                </p>
                <p className="text-[12px] text-[#6B6B6B] italic">
                  <strong>No spam:</strong> remember, this is about promoting everything on the community board.
                </p>
              </div>
              
              {/* Pushpin */}
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

        {/* B2B Contact Section */}
        <div className="mt-16 text-center">
          <div className="relative inline-block">
            <div 
              className="bg-[#2C2C2C] p-6 shadow-lg border-[1px] border-[#E5E5E5] relative mx-auto"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
              }}
            >
              <h2 className="text-[18px] font-semibold text-white leading-[1.3] mb-3">
                💼 For Businesses
              </h2>
              <p className="text-[14px] text-white leading-[1.4] mb-4 max-w-md">
                Want your community board featured on The Drift?
              </p>
              <a 
                href="mailto:michael@rise-above.net?subject=Community Board Request"
                className="inline-block bg-[#F4D03F] text-[#2C2C2C] px-4 py-2 rounded-md text-[14px] font-semibold hover:bg-[#f1c40f] transition-colors"
              >
                Email michael@rise-above.net
              </a>
              
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

      </div>
      
      <footer className="mt-16 py-8 border-t border-stone-200 text-center text-sm text-stone-400">
        <p>Slow News is Good News</p>
        <p className="mt-1">A production of Ofigona, LLC</p>
      </footer>
    </main>
  )
}