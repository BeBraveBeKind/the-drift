import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import convert from 'heic-convert'

// Configure for Netlify Functions (10 second default, extend to 26 seconds)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Add CORS headers to response
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
    console.log('Upload API called at:', new Date().toISOString())
    console.log('Request headers:', {
      contentType: request.headers.get('content-type'),
      contentLength: request.headers.get('content-length'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer')
    })
    
    // Verify environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      })
      return corsResponse(
        NextResponse.json({ 
          error: 'Server configuration error - missing environment variables' 
        }, { status: 500 })
      )
    }
    
    // Create admin client for this request
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Parse form data with timeout protection
    let formData: FormData
    try {
      console.log('Parsing form data...')
      formData = await request.formData()
      console.log('Form data parsed successfully')
    } catch (formError) {
      console.error('Failed to parse form data:', formError)
      return corsResponse(
        NextResponse.json({ 
          error: 'Failed to parse upload data - file may be too large or corrupted' 
        }, { status: 400 })
      )
    }
    
    const file = formData.get('file') as File
    const slug = formData.get('slug') as string
    const town = formData.get('town') as string
    
    if (!file || !slug || !town) {
      console.error('Missing required fields:', { hasFile: !!file, slug, town })
      return corsResponse(
        NextResponse.json({ error: 'Missing file, location, or town' }, { status: 400 })
      )
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
        return corsResponse(
          NextResponse.json({ error: `Town '${town}' not found and could not be created` }, { status: 404 })
        )
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
      return corsResponse(
        NextResponse.json({ error: `Location '${slug}' not found in town '${town}' or is inactive` }, { status: 404 })
      )
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
      // Use sequential processing to avoid memory issues with large files
      processedBuffer = await sharp(imageBuffer, {
        limitInputPixels: 268402689, // ~16k x 16k max
        sequentialRead: true // Process sequentially for large files
      })
        .rotate() // Auto-rotate based on EXIF orientation
        .jpeg({ 
          quality: 85, // Good quality with compression
          progressive: true, // Better web loading
          mozjpeg: true // Better compression algorithm
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
    
    const duration = Date.now() - startTime
    console.log('Upload completed successfully for location:', location.id, `(took ${duration}ms)`)
    return corsResponse(
      NextResponse.json({ success: true, locationId: location.id, duration })
    )
    
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('Upload error after', duration, 'ms:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return corsResponse(
      NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Internal error',
        duration
      }, { status: 500 })
    )
  }
}