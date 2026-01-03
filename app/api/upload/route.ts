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
    const town = formData.get('town') as string
    
    if (!file || !slug || !town) {
      return NextResponse.json({ error: 'Missing file, location, or town' }, { status: 400 })
    }
    
    // Get location
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .eq('town', town)
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
    
    // Use RPC function to properly handle photo upload
    const { error: photoError } = await supabaseAdmin
      .rpc('upload_photo_for_location', {
        p_location_id: location.id,
        p_storage_path: storagePath
      })
    
    if (photoError) {
      console.error('Photo record creation failed:', photoError)
      return NextResponse.json({ error: 'Photo record creation failed' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}