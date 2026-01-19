import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { photoId } = await request.json()
    
    if (!photoId) {
      return NextResponse.json({ error: 'Missing photo' }, { status: 400 })
    }
    
    // Insert flag record (RLS allows anon insert)
    const { error: flagError } = await supabase
      .from('flags')
      .insert({ photo_id: photoId })
    
    if (flagError) {
      console.error('Flag insert error:', flagError)
    }
    
    // Increment flag count via RPC
    await supabase.rpc('increment_flag_count', { p_photo_id: photoId })
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}