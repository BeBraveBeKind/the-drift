import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * SteveCTA — "Have a board? Add it to Switchboard" call to action.
 *
 * Appears below the grid/map on the town page.
 * Entry point for Storefront Steve (business owners).
 */
export default function SteveCTA() {
  return (
    <div className="text-center py-8">
      <Link
        href="/get-listed"
        className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-base no-underline"
        style={{
          background: 'var(--sb-amber)',
          color: 'var(--sb-charcoal)',
          borderRadius: '6px',
          minHeight: '48px',
        }}
      >
        Have a board? Add it to Switchboard
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}
