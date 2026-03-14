import Link from 'next/link'

/**
 * Footer — design system spec.
 * "Real. Local. Now." + links.
 * Flat, no shadows, design system colors.
 */
export default function Footer() {
  return (
    <footer
      className="mt-16 py-12"
      style={{
        borderTop: '1px solid var(--sb-warm-gray)',
      }}
    >
      <div className="max-w-[640px] mx-auto px-4">
        <p
          className="text-center text-lg font-semibold mb-2"
          style={{ color: 'var(--sb-charcoal)' }}
        >
          Real. Local. Now.
        </p>
        <p
          className="text-center text-sm mb-8"
          style={{ color: 'var(--sb-stone)' }}
        >
          &copy; Switchboard {new Date().getFullYear()}
        </p>

        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid var(--sb-warm-gray)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: '24px',
            rowGap: '12px',
            fontSize: '14px',
          }}
        >
          <Link href="/about" className="hover:underline" style={{ color: 'var(--sb-slate)', fontWeight: 500, textDecoration: 'none' }}>
            About
          </Link>
          <Link href="/how-to-post" className="hover:underline" style={{ color: 'var(--sb-slate)', fontWeight: 500, textDecoration: 'none' }}>
            How It Works
          </Link>
          <Link href="/get-listed" className="hover:underline" style={{ color: 'var(--sb-slate)', fontWeight: 500, textDecoration: 'none' }}>
            For Businesses
          </Link>
          <Link href="/start-town" className="hover:underline" style={{ color: 'var(--sb-slate)', fontWeight: 500, textDecoration: 'none' }}>
            For Your Town
          </Link>
          <Link href="/privacy" className="hover:underline" style={{ color: 'var(--sb-slate)', fontWeight: 500, textDecoration: 'none' }}>
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
