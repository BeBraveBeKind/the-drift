import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 py-12" style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Real. Local. Now.
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            From{' '}
            <a 
              href="https://rise-above.net" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: 'var(--link)', textDecoration: 'underline' }}
            >
              Rise Above Partners
            </a>
            {' '}and Ofigona LLC
          </p>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
            <Link 
              href="/about" 
              style={{ color: 'var(--text-secondary)', fontWeight: 500, padding: '0 8px' }} 
              className="hover:underline"
            >
              About
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <Link 
              href="/how-to-post" 
              style={{ color: 'var(--text-secondary)', fontWeight: 500, padding: '0 8px' }} 
              className="hover:underline"
            >
              How to Post
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <Link 
              href="/get-listed" 
              style={{ color: 'var(--text-secondary)', fontWeight: 500, padding: '0 8px' }} 
              className="hover:underline"
            >
              Get Listed
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <Link 
              href="/start-town" 
              style={{ color: 'var(--text-secondary)', fontWeight: 500, padding: '0 8px' }} 
              className="hover:underline"
            >
              Start a Town
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <Link 
              href="/privacy" 
              style={{ color: 'var(--text-secondary)', fontWeight: 500, padding: '0 8px' }} 
              className="hover:underline"
            >
              Privacy
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <a 
              href="mailto:Hello@rise-above.net" 
              className="inline-flex items-center gap-2 font-medium text-sm"
              style={{ color: 'var(--link)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
              Hello@rise-above.net
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}