import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { locationId } = await request.json()
    
    if (!locationId) {
      return NextResponse.json({ error: 'Missing location' }, { status: 400 })
    }
    
    // Use RPC for atomic increment (runs as security definer)
    const { error } = await supabase.rpc('increment_view_count', { loc_id: locationId })
    
    if (error) {
      console.error('View increment error:', error)
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}