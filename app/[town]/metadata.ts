import { Metadata } from 'next'

// Town coordinates for geo-targeting
const TOWN_COORDINATES: Record<string, { lat: number; lng: number; state: string; fullName: string }> = {
  viroqua: { lat: 43.5548, lng: -90.8886, state: 'Wisconsin', fullName: 'Viroqua' },
  // Add more towns as they're onboarded
}

export function generateTownMetadata(townSlug: string): Metadata {
  const townInfo = TOWN_COORDINATES[townSlug.toLowerCase()]
  
  if (!townInfo) {
    return {
      title: `${townSlug.charAt(0).toUpperCase() + townSlug.slice(1)} Community Board`,
      description: `Connect with the ${townSlug} community. Find local events, services, and businesses.`
    }
  }

  const { fullName, state, lat, lng } = townInfo

  return {
    title: `${fullName}, ${state} Community Bulletin Board`,
    description: `Connect with ${fullName}, ${state} community. Find local events, services, businesses, and announcements on our digital bulletin board.`,
    keywords: [
      `${fullName} ${state}`,
      `${fullName} events`,
      `${fullName} community`,
      `${fullName} local business`,
      `${fullName} services`,
      `${state} small town`,
      'community bulletin board'
    ],
    openGraph: {
      title: `${fullName}, ${state} Community Board | Switchboard`,
      description: `Connect with ${fullName} community. Find local events, services, and businesses.`,
      type: 'website',
      locale: 'en_US',
    },
    other: {
      'geo.region': `US-${state.substring(0, 2).toUpperCase()}`,
      'geo.placename': fullName,
      'geo.position': `${lat};${lng}`,
      'ICBM': `${lat}, ${lng}`,
    }
  }
}

export function generateTownStructuredData(townSlug: string) {
  const townInfo = TOWN_COORDINATES[townSlug.toLowerCase()]
  
  if (!townInfo) return null

  const { fullName, state, lat, lng } = townInfo

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Switchboard ${fullName}`,
    "description": `Community bulletin board for ${fullName}, ${state}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": fullName,
      "addressRegion": state,
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": lat,
      "longitude": lng
    },
    "url": `https://switchboard.town/${townSlug}`,
    "areaServed": {
      "@type": "City",
      "name": fullName,
      "containedInPlace": {
        "@type": "State",
        "name": state
      }
    }
  }
}