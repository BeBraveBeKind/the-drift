import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import convert from 'heic-convert'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called')
    
    // Verify service role key exists
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    // Create admin client for this request
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const slug = formData.get('slug') as string
    const town = formData.get('town') as string
    
    if (!file || !slug || !town) {
      console.error('Missing required fields:', { hasFile: !!file, slug, town })
      return NextResponse.json({ error: 'Missing file, location, or town' }, { status: 400 })
    }
    
    console.log('Processing upload:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      slug,
      town 
    })
    
    // First try to get town by slug
    let { data: townData } = await supabaseAdmin
      .from('towns')
      .select('id')
      .eq('slug', town)
      .single()
    
    // If town doesn't exist, create it (for MVP, auto-create towns)
    if (!townData) {
      console.log(`Town '${town}' not found, creating it...`)
      
      const { data: newTown, error: createError } = await supabaseAdmin
        .from('towns')
        .insert({
          name: town.charAt(0).toUpperCase() + town.slice(1),
          slug: town,
          is_active: true
        })
        .select('id')
        .single()
      
      if (createError) {
        console.error('Failed to create town:', createError)
        return NextResponse.json({ error: `Town '${town}' not found and could not be created` }, { status: 404 })
      }
      
      townData = newTown
    }
    
    console.log('Using town:', { town, townId: townData.id })
    
    // Get location using town_id OR town field (for backwards compatibility)
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .or(`town_id.eq.${townData.id},town.eq.${town}`)
      .eq('is_active', true)
      .single()
    
    if (!location) {
      console.error('Location not found:', { slug, townId: townData.id })
      return NextResponse.json({ error: `Location '${slug}' not found in town '${town}' or is inactive` }, { status: 404 })
    }
    
    console.log('Found location:', { slug, locationId: location.id })
    
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
      return NextResponse.json({ 
        error: `Storage upload failed: ${uploadError.message || 'Unknown error'}` 
      }, { status: 500 })
    }
    
    console.log('File uploaded to storage:', storagePath)
    
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
      
      // Try to clean up the uploaded file
      await supabaseAdmin.storage
        .from('board-photos')
        .remove([storagePath])
      
      return NextResponse.json({ 
        error: `Database error: ${photoError.message || 'Failed to save photo record'}` 
      }, { status: 500 })
    }
    
    console.log('Photo record created successfully')
    
    // Update location timestamp
    await supabaseAdmin
      .from('locations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', location.id)
    
    console.log('Upload completed successfully for location:', location.id)
    return NextResponse.json({ success: true, locationId: location.id })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}