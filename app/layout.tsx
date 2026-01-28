import { Metadata, Viewport } from 'next'
import './globals.css'
import Analytics from '@/components/Analytics'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://switchboard.town'),
  title: {
    default: 'Switchboard | Real. Local. Now.',
    template: '%s | Switchboard'
  },
  description: 'Your community bulletin board, digitized. No logins, no algorithms, no nonsense.',
  keywords: ['community bulletin board', 'local events', 'small town', 'local business', 'community services', 'rural communities'],
  authors: [{ name: 'Rise Above Partners' }],
  creator: 'Rise Above Partners',
  publisher: 'Rise Above Partners',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' }
    ],
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      }
    ]
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://switchboard.town',
    siteName: 'Switchboard',
    title: 'Switchboard | Real. Local. Now.',
    description: 'Your community bulletin board, digitized.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Switchboard - Real. Local. Now.',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Switchboard | Real. Local. Now.',
    description: 'Your community bulletin board, digitized.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  }
}

// Structured data for local business/community platform
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Switchboard",
  "description": "Local community bulletin boards for small towns",
  "url": "https://switchboard.town",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://switchboard.town/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Rise Above Partners",
    "email": "Hello@rise-above.net"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Analytics */}
        <Analytics />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Critical preconnects with dns-prefetch fallback */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}
        
        {/* Favicons - handled by metadata but kept for legacy support */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preload critical font weights to prevent CLS */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/quicksand/v31/6xKtdSZaM9iE8KbpRA_hK1QNYuDyPw.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Load fonts with swap to reduce blocking and prevent FOIT */}
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
        {/* Inline critical CSS to prevent render blocking */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for preventing layout shift */
            .font-quicksand {
              font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            /* Prevent CLS on main content */
            body {
              min-height: 100vh;
              background-color: #C4A574;
            }
            
            /* Skeleton styles for initial load */
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            
            .animate-pulse {
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            /* Reserve space for navigation */
            .nav-placeholder {
              height: 64px;
            }
            
            /* Optimize image rendering */
            img {
              content-visibility: auto;
              contain-intrinsic-size: 280px 210px;
            }
          `
        }} />
        
        {/* Register service worker for better caching */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
              });
            }
          `
        }} />
      </head>
      <body className="font-quicksand bg-[#C4A574] min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}