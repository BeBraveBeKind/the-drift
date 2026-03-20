import { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F59E0B',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://switchboard.town'),
  title: {
    default: 'Switchboard — Community Bulletin Boards Online',
    template: '%s | Switchboard'
  },
  description: 'Switchboard brings your community bulletin board online. Discover local businesses, events, and services posted on real bulletin boards in your town — no logins, no algorithms.',
  keywords: ['community bulletin board', 'local events', 'small town', 'local business', 'community services', 'rural communities', 'bulletin board online'],
  authors: [{ name: 'Ofigona LLC' }],
  creator: 'Ofigona LLC',
  publisher: 'Ofigona LLC',
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
    title: 'Switchboard — Community Bulletin Boards Online',
    description: 'Discover local businesses, events, and services posted on real community bulletin boards in your town.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Switchboard — Community Bulletin Boards Online',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Switchboard — Community Bulletin Boards Online',
    description: 'Discover local businesses, events, and services posted on real community bulletin boards in your town.',
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
    canonical: 'https://switchboard.town',
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
    "name": "Ofigona LLC",
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
        {/* Plausible Analytics — privacy-first, no cookies, GDPR-compliant */}
        <script
          async
          src="https://plausible.io/js/pa-E3IB4m_nCRcwkyW3n0SIJ.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`,
          }}
        />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Critical preconnects */}
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

        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Plus Jakarta Sans — design system font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Inline critical CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              min-height: 100vh;
              background-color: #FFFBEB;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .animate-pulse {
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
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
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
