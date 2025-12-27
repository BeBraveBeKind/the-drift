import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Create admin client for this request
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const slug = formData.get('slug') as string
    
    if (!file || !slug) {
      return NextResponse.json({ error: 'Missing file or location' }, { status: 400 })
    }
    
    // Get location
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }
    
    // Upload
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'jpg'
    const storagePath = `${location.id}/${timestamp}.${ext}`
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('board-photos')
      .upload(storagePath, file, { contentType: file.type })
    
    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
    
    // Create record + set current
    await supabaseAdmin
      .from('photos')
      .insert({
        location_id: location.id,
        storage_path: storagePath,
        is_current: true
      })
    
    // Update location timestamp
    await supabaseAdmin
      .from('locations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', location.id)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}