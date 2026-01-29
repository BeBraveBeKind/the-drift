import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSession } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: NextRequest) {
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
    
    // Get auto-flagged photos pending review
    const { data, error } = await supabaseAdmin.rpc('get_auto_flagged_for_review')

    if (error) {
      console.error('Error fetching auto-flagged photos:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      events: data || [],
      count: data?.length || 0 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch auto-flagged photos' 
    }, { status: 500 })
  }
}

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
    
    const body = await request.json()
    const { event_id, action } = body
    
    if (!event_id || !action) {
      return NextResponse.json({ 
        error: 'event_id and action are required' 
      }, { status: 400 })
    }

    // Mark the event as reviewed
    const { error } = await supabaseAdmin.rpc('mark_auto_flag_reviewed', {
      p_event_id: event_id,
      p_action: action,
      p_reviewer: session.email || 'admin'
    })

    if (error) {
      console.error('Error marking auto-flag as reviewed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update auto-flag status' 
    }, { status: 500 })
  }
}