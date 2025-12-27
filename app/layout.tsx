import './globals.css'
import { Quicksand } from 'next/font/google'

const quicksand = Quicksand({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

export const metadata = {
  title: 'The Drift',
  description: 'Discover what\'s happening beyond social media',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${quicksand.className} bg-[#C4A574] min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
