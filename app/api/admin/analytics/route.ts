import { NextRequest, NextResponse } from 'next/server'

const PLAUSIBLE_API_KEY = process.env.PLAUSIBLE_API_KEY
const PLAUSIBLE_SITE_ID = 'switchboard.town'
const PLAUSIBLE_API_URL = 'https://plausible.io/api/v2/query'
const PLAUSIBLE_V1_URL = 'https://plausible.io/api/v1/stats'

/**
 * Admin analytics proxy — keeps Plausible API key server-side.
 *
 * GET /api/admin/analytics?q=overview    → visitors, pageviews, bounce rate (30d)
 * GET /api/admin/analytics?q=realtime    → current visitor count
 * GET /api/admin/analytics?q=pages       → top pages by visitors (30d)
 * GET /api/admin/analytics?q=sources     → traffic sources (30d)
 * GET /api/admin/analytics?q=timeseries  → daily visitors (30d)
 * GET /api/admin/analytics?q=events      → custom event breakdown (30d)
 */
export async function GET(request: NextRequest) {
  if (!PLAUSIBLE_API_KEY) {
    return NextResponse.json(
      { error: 'PLAUSIBLE_API_KEY not configured' },
      { status: 500 }
    )
  }

  const query = request.nextUrl.searchParams.get('q') || 'overview'
  const period = request.nextUrl.searchParams.get('period') || '30d'

  const headers = {
    Authorization: `Bearer ${PLAUSIBLE_API_KEY}`,
    'Content-Type': 'application/json',
  }

  try {
    // Realtime uses the v1 endpoint (no v2 equivalent)
    if (query === 'realtime') {
      const res = await fetch(
        `${PLAUSIBLE_V1_URL}/realtime/visitors?site_id=${PLAUSIBLE_SITE_ID}`,
        { headers, next: { revalidate: 30 } }
      )
      if (!res.ok) throw new Error(`Plausible API error: ${res.status}`)
      const count = await res.json()
      return NextResponse.json({ realtime_visitors: count })
    }

    // All other queries use v2
    const body = buildQuery(query, period)
    const res = await fetch(PLAUSIBLE_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      next: { revalidate: 300 }, // cache 5 min
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Plausible API error:', errText)
      throw new Error(`Plausible API error: ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Analytics proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 502 }
    )
  }
}

function buildQuery(query: string, period: string) {
  const base = {
    site_id: PLAUSIBLE_SITE_ID,
    date_range: period,
  }

  switch (query) {
    case 'overview':
      return {
        ...base,
        metrics: ['visitors', 'pageviews', 'bounce_rate', 'visit_duration', 'visits'],
      }

    case 'pages':
      return {
        ...base,
        metrics: ['visitors', 'pageviews'],
        dimensions: ['event:page'],
        order_by: [['visitors', 'desc']],
        pagination: { limit: 20 },
      }

    case 'sources':
      return {
        ...base,
        metrics: ['visitors'],
        dimensions: ['visit:source'],
        order_by: [['visitors', 'desc']],
        pagination: { limit: 10 },
      }

    case 'timeseries':
      return {
        ...base,
        metrics: ['visitors', 'pageviews'],
        dimensions: ['time:day'],
      }

    case 'events':
      return {
        ...base,
        metrics: ['visitors', 'events'],
        dimensions: ['event:name'],
        filters: [['is', 'event:name', ['pageview'], { negated: true }]],
        order_by: [['events', 'desc']],
      }

    default:
      return {
        ...base,
        metrics: ['visitors', 'pageviews'],
      }
  }
}
