import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { buildSign, SIGN_SIZES } from '@/lib/sign-generator'

interface RouteParams {
  params: Promise<{ town: string; slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { town, slug } = await params
  const size = request.nextUrl.searchParams.get('size') || '6x9'

  // Look up the business
  const { data: townData } = await supabase
    .from('towns')
    .select('id, name')
    .eq('slug', town)
    .single()

  if (!townData) {
    return NextResponse.json({ error: 'Town not found' }, { status: 404 })
  }

  const { data: location } = await supabase
    .from('locations')
    .select('name, slug, address')
    .eq('slug', slug)
    .eq('town_id', townData.id)
    .single()

  if (!location) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const orientation = request.nextUrl.searchParams.get('orientation') || 'landscape'

  // Resolve dimensions
  const preset = SIGN_SIZES[size]
  let w: number, h: number
  if (preset) {
    w = preset.w
    h = preset.h
    // Swap for portrait
    if (orientation === 'portrait') {
      ;[w, h] = [h, w]
    }
  } else {
    // Custom size: WxH in inches
    const parts = size.split('x')
    if (parts.length !== 2) {
      return NextResponse.json({ error: 'Invalid size' }, { status: 400 })
    }
    w = Math.floor(parseFloat(parts[0]) * 96)
    h = Math.floor(parseFloat(parts[1]) * 96)
    if (isNaN(w) || isNaN(h) || w < 100 || h < 100) {
      return NextResponse.json({ error: 'Invalid size' }, { status: 400 })
    }
  }

  const url = `https://switchboard.town/${town}/${location.slug}`
  const address = location.address || `${townData.name}`

  const svg = buildSign(w, h, location.name, address, url)

  const filename = `switchboard-sign-${location.slug}-${size}.svg`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
