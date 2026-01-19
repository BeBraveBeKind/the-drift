'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b-2 border-[#2C2C2C] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl text-[#2C2C2C] hover:text-[#000000] transition-colors flex items-center gap-2">
            <span className="text-2xl">📌</span>
            <span>Switchboard</span>
          </Link>

          {/* Menu button with "MENU" label */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-[#2C2C2C] text-white rounded-lg hover:bg-[#000000] transition-colors font-semibold"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span className="text-sm">MENU</span>
          </button>
        </div>

        {/* Navigation Menu - for all screen sizes */}
        {menuOpen && (
          <div className="py-4 border-t-2 border-[#2C2C2C]">
            <div className="flex flex-col gap-4">
              <Link 
                href="/about" 
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/how-to-post" 
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                How to Post
              </Link>
              <Link 
                href="/get-listed" 
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Get Your Business Listed
              </Link>
              <Link 
                href="/start-town" 
                className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-900 transition-colors text-sm font-medium text-center"
                onClick={() => setMenuOpen(false)}
              >
                Start a Town
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}