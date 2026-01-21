'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [menuOpen])

  return (
    <>
      <nav className="site-header" style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100 
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="site-header__logo" 
              style={{ 
                fontSize: '1.25rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)', 
                textDecoration: 'none' 
              }}
            >
              Switchboard
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2"
              aria-label="Menu"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <>
                    <path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Clean Dropdown Menu */}
      <div 
        className={`fixed top-16 right-0 z-40 transition-all duration-200 ease-in-out ${
          menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
        }`}
        style={{ 
          width: '100%',
          maxWidth: '100vw',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <nav className="space-y-1">
            <Link 
              href="/towns" 
              className="block py-3 text-[17px] font-medium transition-colors hover:opacity-70"
              style={{ 
                color: 'var(--text-primary)',
                textDecoration: 'none'
              }}
              onClick={() => setMenuOpen(false)}
            >
              See Towns
            </Link>
            <Link 
              href="/about" 
              className="block py-3 text-[17px] font-medium transition-colors hover:opacity-70"
              style={{ 
                color: 'var(--text-primary)',
                textDecoration: 'none'
              }}
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/how-to-post" 
              className="block py-3 text-[17px] font-medium transition-colors hover:opacity-70"
              style={{ 
                color: 'var(--text-primary)',
                textDecoration: 'none'
              }}
              onClick={() => setMenuOpen(false)}
            >
              How to Post
            </Link>
            <Link 
              href="/get-listed" 
              className="block py-3 text-[17px] font-medium transition-colors hover:opacity-70"
              style={{ 
                color: 'var(--text-primary)',
                textDecoration: 'none'
              }}
              onClick={() => setMenuOpen(false)}
            >
              Get Listed
            </Link>
            <div className="pt-2">
              <Link 
                href="/start-town" 
                className="btn-primary w-full"
                style={{ 
                  textDecoration: 'none'
                }}
                onClick={() => setMenuOpen(false)}
              >
                Start a Town
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-30" 
          style={{ top: '64px' }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}