import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import convert from 'heic-convert'

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
    
    // First get town to get its ID
    const { data: townData } = await supabaseAdmin
      .from('towns')
      .select('id')
      .eq('slug', town)
      .eq('is_active', true)
      .single()
    
    if (!townData) {
      return NextResponse.json({ error: 'Town not found' }, { status: 404 })
    }
    
    // Get location using town_id
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .eq('town_id', townData.id)
      .eq('is_active', true)
      .single()
    
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }
    
    // Process and convert image
    const timestamp = Date.now()
    
    let processedBuffer: Buffer
    
    try {
      const buffer = await file.arrayBuffer()
      const inputBuffer = Buffer.from(buffer)
      
      // Check if it's HEIC/HEIF format
      const isHEIC = file.name.toLowerCase().endsWith('.heic') || 
                     file.name.toLowerCase().endsWith('.heif') ||
                     file.type === 'image/heic' ||
                     file.type === 'image/heif'
      
      let imageBuffer: Buffer
      
      if (isHEIC) {
        console.log(`Converting HEIC to JPEG: ${file.name}`)
        try {
          // Convert HEIC to JPEG first
          const jpegBuffer = await convert({
            buffer: inputBuffer,
            format: 'JPEG',
            quality: 0.9
          })
          imageBuffer = Buffer.from(jpegBuffer)
        } catch (heicError) {
          console.error('HEIC conversion failed:', heicError)
          // Fallback: try sharp directly (might work for some HEIC files)
          imageBuffer = inputBuffer
        }
      } else {
        imageBuffer = inputBuffer
      }
      
      // Process with sharp for final optimization
      processedBuffer = await sharp(imageBuffer)
        .rotate() // Auto-rotate based on EXIF orientation
        .jpeg({ 
          quality: 85, // Good quality with compression
          progressive: true // Better web loading
        })
        .resize(2048, 2048, { // Max 2048px on longest side
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer()
      
      console.log(`Image processed: ${file.name} (${file.type}) -> JPEG (${processedBuffer.length} bytes)`)
      
    } catch (conversionError) {
      console.error('Image processing failed:', conversionError)
      return NextResponse.json({ error: 'Image format not supported or corrupted. Try converting HEIC to JPG on your device first.' }, { status: 400 })
    }
    
    const storagePath = `${location.id}/${timestamp}.jpg` // Always save as JPEG
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('board-photos')
      .upload(storagePath, processedBuffer, { 
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })
    
    if (uploadError) {
      console.error('Storage upload failed:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
    
    // Mark existing photos as not current
    await supabaseAdmin
      .from('photos')
      .update({ is_current: false })
      .eq('location_id', location.id)
    
    // Insert new photo as current
    const { error: photoError } = await supabaseAdmin
      .from('photos')
      .insert({
        location_id: location.id,
        storage_path: storagePath,
        is_current: true
      })
    
    if (photoError) {
      console.error('Photo record creation failed:', photoError)
      return NextResponse.json({ error: 'Photo record creation failed' }, { status: 500 })
    }
    
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