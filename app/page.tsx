import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Switchboard - Local Community Bulletin Boards',
  description: 'Connect with your local community.'
}

// For MVP, we only have Viroqua, so let's redirect there automatically
// Later we can expand this to show a town picker

export default function LandingPage() {
  // Server-side redirect is much faster than client-side
  redirect('/viroqua')
}