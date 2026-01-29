import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Configure route segment for larger uploads and longer timeout
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max for Vercel Pro

// Add CORS headers
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 200 }))
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('Fast upload started at:', new Date().toISOString())
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return corsResponse(
        NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      )
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const slug = formData.get('slug') as string
    const town = formData.get('town') as string
    
    if (!file || !slug || !town) {
      return corsResponse(
        NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      )
    }
    
    console.log('Processing:', { fileName: file.name, size: file.size, slug, town })
    
    // Get or create town
    let { data: townData } = await supabaseAdmin
      .from('towns')
      .select('id')
      .eq('slug', town)
      .single()
    
    if (!townData) {
      const { data: newTown } = await supabaseAdmin
        .from('towns')
        .insert({
          name: town.charAt(0).toUpperCase() + town.slice(1),
          slug: town,
          is_active: true
        })
        .select('id')
        .single()
      
      townData = newTown
    }
    
    // Get location
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .or(`town_id.eq.${townData?.id},town.eq.${town}`)
      .eq('is_active', true)
      .single()
    
    if (!location) {
      return corsResponse(
        NextResponse.json({ error: 'Location not found' }, { status: 404 })
      )
    }
    
    // Upload directly without processing - let Supabase handle it
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const storagePath = `${location.id}/${timestamp}.${fileExt}`
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log('Uploading to storage...')
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('board-photos')
      .upload(storagePath, buffer, { 
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Storage upload failed:', uploadError)
      return corsResponse(
        NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
      )
    }
    
    // Update database
    await supabaseAdmin
      .from('photos')
      .update({ is_current: false })
      .eq('location_id', location.id)
    
    await supabaseAdmin
      .from('photos')
      .insert({
        location_id: location.id,
        storage_path: storagePath,
        is_current: true
      })
    
    await supabaseAdmin
      .from('locations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', location.id)
    
    const duration = Date.now() - startTime
    console.log(`Upload completed in ${duration}ms`)
    
    return corsResponse(
      NextResponse.json({ success: true, locationId: location.id, duration })
    )
    
  } catch (error) {
    console.error('Upload error:', error)
    return corsResponse(
      NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }, { status: 500 })
    )
  }
}