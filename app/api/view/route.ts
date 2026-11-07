import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isUuid } from '@/lib/visitor-key'

export async function POST(request: NextRequest) {
  try {
    let locationId: unknown
    try {
      locationId = (await request.json())?.locationId
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!isUuid(locationId)) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      console.error('View route: server configuration incomplete')
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // Atomic increment via RPC
    const { error } = await supabaseAdmin.rpc('increment_view_count', { loc_id: locationId })

    if (error) {
      console.error('View increment error:', error.message)
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('View route error:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
