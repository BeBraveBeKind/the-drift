'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

/**
 * Navigation — design system spec.
 * Sticky white bar, 640px max, Lucide icons.
 * Marketing nav variant will be built with marketing pages.
 */
export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [menuOpen])

  return (
    <>
      <nav
        className="sticky top-0 z-50 h-16"
        style={{
          backgroundColor: 'var(--sb-white)',
          borderBottom: '1px solid var(--sb-warm-gray)',
        }}
      >
        <div className="max-w-[640px] mx-auto px-4 h-full flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold"
            style={{ color: 'var(--sb-charcoal)', textDecoration: 'none' }}
          >
            Switchboard
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex items-center justify-center"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            {menuOpen ? (
              <X size={24} color="var(--sb-charcoal)" />
            ) : (
              <Menu size={24} color="var(--sb-charcoal)" />
            )}
          </button>
        </div>
      </nav>

      {/* Dropdown */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 transition-all duration-150 ease-in-out ${
          menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--sb-white)',
          borderBottom: '1px solid var(--sb-warm-gray)',
        }}
      >
        <div className="max-w-[640px] mx-auto px-4 py-4 space-y-1">
          <Link
            href="/towns"
            className="block py-3 text-base font-medium"
            style={{ color: 'var(--sb-charcoal)', textDecoration: 'none' }}
            onClick={() => setMenuOpen(false)}
          >
            Towns
          </Link>
          <Link
            href="/about"
            className="block py-3 text-base font-medium"
            style={{ color: 'var(--sb-charcoal)', textDecoration: 'none' }}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/how-to-post"
            className="block py-3 text-base font-medium"
            style={{ color: 'var(--sb-charcoal)', textDecoration: 'none' }}
            onClick={() => setMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/get-listed"
            className="block py-3 text-base font-medium"
            style={{ color: 'var(--sb-charcoal)', textDecoration: 'none' }}
            onClick={() => setMenuOpen(false)}
          >
            For Businesses
          </Link>
          <Link
            href="/for-chambers"
            className="block py-3 text-base font-medium"
            style={{ color: 'var(--sb-charcoal)', textDecoration: 'none' }}
            onClick={() => setMenuOpen(false)}
          >
            For Chambers
          </Link>
          <div className="pt-2">
            <Link
              href="/start-town"
              className="btn-primary w-full text-center"
              style={{ textDecoration: 'none' }}
              onClick={() => setMenuOpen(false)}
            >
              Bring Switchboard to Your Town
            </Link>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-30"
          style={{ top: 64 }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}
