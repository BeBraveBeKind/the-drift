import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSession } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get request body
    const body = await request.json()
    const { location_id, photo_id, reason } = body
    
    if (!location_id || !photo_id) {
      return NextResponse.json({ 
        error: 'location_id and photo_id are required' 
      }, { status: 400 })
    }

    // Call the database function to revert the photo
    const { data, error } = await supabaseAdmin.rpc('admin_revert_photo', {
      p_location_id: location_id,
      p_photo_id: photo_id,
      p_reason: reason || null
    })

    if (error) {
      console.error('Error reverting photo:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      result: data 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to revert photo' 
    }, { status: 500 })
  }
}