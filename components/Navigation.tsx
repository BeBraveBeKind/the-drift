'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl text-stone-900 hover:text-stone-700 transition-colors">
            📌 Switchboard
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/about" 
              className="text-stone-700 hover:text-stone-900 transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              href="/how-to-post" 
              className="text-stone-700 hover:text-stone-900 transition-colors font-medium"
            >
              How to Post
            </Link>
            <Link 
              href="/get-listed" 
              className="text-stone-700 hover:text-stone-900 transition-colors font-medium"
            >
              Get Listed
            </Link>
            <Link 
              href="/start-town" 
              className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-900 transition-colors text-sm font-medium"
            >
              Start a Town
            </Link>
          </div>

          {/* Mobile menu button - Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors border border-[#2C2C2C]"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-[#2C2C2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200">
            <div className="flex flex-col gap-4">
              <Link 
                href="/about" 
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/how-to-post" 
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                How to Post
              </Link>
              <Link 
                href="/get-listed" 
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Your Business Listed
              </Link>
              <Link 
                href="/start-town" 
                className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-900 transition-colors text-sm font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
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