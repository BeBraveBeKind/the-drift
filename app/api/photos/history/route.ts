import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get location_id from query params
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('location_id')
    
    if (!locationId) {
      return NextResponse.json({ error: 'location_id is required' }, { status: 400 })
    }

    // Call the database function to get photo history
    const { data, error } = await supabaseAdmin.rpc('get_photo_history', {
      p_location_id: locationId,
      p_limit: 20
    })

    if (error) {
      console.error('Error fetching photo history:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Build full photo URLs server-side (DB function returns storage_path only)
    const photos = (data || []).map((photo: { storage_path: string; photo_url?: string; [key: string]: unknown }) => ({
      ...photo,
      photo_url: `${supabaseUrl}/storage/v1/object/public/board-photos/${photo.storage_path}`
    }))

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch photo history' 
    }, { status: 500 })
  }
}