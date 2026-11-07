import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { centralDay, clientIp, flagOutcome, isUuid, visitorKey } from '@/lib/visitor-key'

const HOURLY_FLAG_LIMIT = 10

export async function POST(request: NextRequest) {
  try {
    let photoId: unknown
    try {
      photoId = (await request.json())?.photoId
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!isUuid(photoId)) {
      return NextResponse.json({ error: 'Invalid photo' }, { status: 400 })
    }

    const salt = process.env.FLAG_SALT
    if (!supabaseAdmin || !salt) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const key = visitorKey(
      clientIp(request.headers),
      request.headers.get('user-agent') ?? '',
      salt,
      centralDay(new Date())
    )

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabaseAdmin
      .from('flags')
      .select('id', { count: 'exact', head: true })
      .eq('visitor_key', key)
      .gte('created_at', since)

    if (countError) {
      console.error('Flag count error:', countError.message)
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
    if ((count ?? 0) >= HOURLY_FLAG_LIMIT) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { error: insertError } = await supabaseAdmin
      .from('flags')
      .insert({ photo_id: photoId, visitor_key: key })

    const outcome = flagOutcome(insertError)
    if (outcome === 'duplicate') {
      return NextResponse.json({ success: true, counted: false })
    }
    if (outcome === 'error') {
      console.error('Flag insert error:', insertError?.message)
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }

    const { error: rpcError } = await supabaseAdmin.rpc('increment_flag_count', {
      p_photo_id: photoId,
    })
    if (rpcError) {
      console.error('Flag count increment error:', rpcError.message)
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, counted: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
