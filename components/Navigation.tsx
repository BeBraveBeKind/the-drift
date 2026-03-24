'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, MapPin } from 'lucide-react'

/**
 * Navigation — single-town variant.
 * Logo left, town pill + hamburger right.
 * Hamburger holds secondary/B2B pages only.
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Town pill — direct link to the live town */}
            <Link
              href="/viroqua"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--sb-radius-badge)',
                background: pathname.startsWith('/viroqua')
                  ? 'var(--sb-amber)'
                  : 'var(--sb-warm-white)',
                border: pathname.startsWith('/viroqua')
                  ? '1px solid var(--sb-amber)'
                  : '1px solid var(--sb-warm-gray)',
                color: 'var(--sb-charcoal)',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all var(--sb-transition)',
                minHeight: '36px',
              }}
            >
              <MapPin size={14} color="var(--sb-amber)" />
              Viroqua
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
        </div>
      </nav>

      {/* Dropdown — secondary pages only */}
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
            href="/about"
            className="block py-3 text-base font-medium"
            style={{ color: 'var(--sb-charcoal)', textDecoration: 'none' }}
            onClick={() => setMenuOpen(false)}
          >
            About
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
          <Link
            href="/start-town"
            className="block py-3 text-base font-medium"
            style={{ color: 'var(--sb-charcoal)', textDecoration: 'none' }}
            onClick={() => setMenuOpen(false)}
          >
            Start a Town
          </Link>
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
